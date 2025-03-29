import os
import click
import json
import math
from pathlib import Path
from jinja2 import Environment, FileSystemLoader
import logging
from openai import OpenAI
from dotenv import load_dotenv
import openai
import litellm
from datetime import datetime
import pydantic
from typing import List, Dict, Union, Any, Tuple, Optional
from pathlib import Path
import tqdm

# Load environment variables from .env file
load_dotenv()


class Tweet(pydantic.BaseModel):
    username: Optional[str] = None
    handle: Optional[str] = None
    timestamp: Optional[str] = None
    replying_to: Optional[List[str]] = None
    tweet: str
    retrieved_by: Optional[str] = None
    followers: Optional[int] = None
    following: Optional[int] = None
    likes: Optional[int] = None
    reposts: Optional[int] = None
    replies: Optional[int] = None
    lang: Optional[str] = None


class Tweets(pydantic.BaseModel):
    session_id: Optional[str] = None
    retrieved_by: Optional[str] = None
    tweets: List[Tweet]


def api_generate(
    prompts: Union[List[str], List[List[Dict[str, str]]]],
    model: str,
    num_retries: int = 4,
    batch_size: int = 20,
    max_new_tokens=128,
    tqdm_enabled: bool = False,  # Nawwww
    convert_to_text: bool = True,
) -> List[str]:
    """
    This is a helper function to make it easy to generate using various LLM APIs
    (e.g. OpenAI, Anthropic, etc.) with built in error-handling.

    prompts can be either a list of string prompts, or it can be a list of multi-turn
    conversations in huggingface format:
        [
            {"role": "user", "content": user_input},
            {"role": "assistant", "content": assistant_response},
            {"role": "user", "content": user_input1},
            ...
        ]
    TODO(Adriano) you might want to add system prompts.
    """

    # If we pass a list of prompts, convert to message format
    if isinstance(prompts[0], str):
        prompts = [[{"role": "user", "content": p}] for p in prompts]

    try:
        # Attempt batched completion call with litellm
        responses = []
        _range = (
            tqdm.trange(
                0, len(prompts), batch_size, total=math.ceil(len(prompts) / batch_size)
            )
            if tqdm_enabled
            else range(0, len(prompts), batch_size)
        )
        for i in _range:
            r = litellm.batch_completion(
                model=model,
                messages=prompts[i : i + batch_size],
                max_tokens=max_new_tokens,
                num_retries=num_retries,
            )
            responses.extend(r)
        ret = responses
        if convert_to_text:
            ret = [r.choices[0].message.content for r in responses]

    except openai.OpenAIError as e:
        # Error handling
        should_retry = litellm._should_retry(e.status_code)
        print("Error: API failed to respond.", e, f"should_retry: {should_retry}")
        ret = []

    return ret


def perplexity_response(text: str) -> Any:
    """
    Helper to query from perplexity API.
    """
    assert "PERPLEXITY_API_KEY" in os.environ, "PERPLEXITY_API_KEY is not set"
    assert os.environ["PERPLEXITY_API_KEY"].strip() != "", "PERPLEXITY_API_KEY is empty"

    messages = [
        {
            # TODO(Adriano) the system prompt should not be hardcoded ay lmao
            "role": "system",
            "content": (
                "You are an artificial intelligence assistant and you need to help fact check tweets and other information "
                + "the user may share with you. At all times make sure to be helpful, concise, and do NOT act overconfident. "
                + "Cite everything you do, search for relevant and reliable sources (such as official news sources from reliable "
                + "outlets such as the NYT, BBC, WSJ, AP News, etc...) and if the answers are not clear say you don't know. Back up every single claim."
            ),
        },
        {
            "role": "user",
            "content": text,
        },
    ]
    client = OpenAI(
        api_key=os.environ["PERPLEXITY_API_KEY"], base_url="https://api.perplexity.ai"
    )

    # chat completion without streaming
    response = client.chat.completions.create(
        model="sonar-pro",
        messages=messages,
    )
    # print(response)
    return response


def load_prompt_template(
    template_name: str, template_dir: Path = Path.cwd() / "templates"
):
    """
    Loads a Jinja2 template from the specified directory.

    Args:
        template_name: Name of the template file (e.g., 'analyze.jinja2')
        template_dir: Directory containing the templates (default: 'prompts')

    Returns:
        A Jinja2 Template object that can be used to render the template with variables.
        Usage example:
            template = load_prompt_template('analyze.jinja2')
            rendered_prompt = template.render(user_name='John', data=some_data)
    """
    # Create the Jinja2 environment with the template directory
    env = Environment(
        loader=FileSystemLoader(template_dir), trim_blocks=True, lstrip_blocks=True
    )

    # Load and return the template
    return env.get_template(template_name)


@click.command()
@click.option("--prompt_filename", "-p", type=str, help="The prompt to render")
@click.option(
    "--output_filename",
    type=str,
    help="The output file to save the results to",
    default="entity_extraction_responses.json",
)
def main(prompt_filename: str, output_filename: str):
    """
    A demo application that just "parses" a bunch of tweets to extract some
    relevant information (i.e. right now entities).
    """
    # Configure logging
    logging_enabled = os.getenv("ENABLE_LOGGING", "false").lower() in [
        "true",
        "1",
        "yes",
        "y",
    ]
    log_level = os.getenv("LOG_LEVEL", "info").upper()
    log_dir = Path(os.getenv("LOG_DIR", "logs"))
    log_file_path = (
        log_dir / f"api_requests_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
    )

    if logging_enabled:
        # Create logs directory if it doesn't exist
        Path(log_file_path).parent.mkdir(parents=True, exist_ok=True)

        # Setup logging configuration
        logging.basicConfig(
            level=getattr(logging, log_level),
            format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            handlers=[logging.FileHandler(log_file_path), logging.StreamHandler()],
        )
        logger = logging.getLogger(__name__)
        logger.info("Logging initialized")

    data_dir = Path(os.getenv("DATA_DIR", "data"))
    tweets_file_path = data_dir / "tweets_v2.json"
    #tweets = Tweets.model_validate_json(tweets_file_path.read_text())
    tweets = Tweets.model_validate_json(tweets_file_path.read_text(encoding="utf-8"))


    # Do a demo where we extract entities from a tweet
    # Model configuration
    model_name = os.getenv("MODEL_NAME", "gpt-4-turbo")
    max_tokens = int(os.getenv("MAX_TOKENS", 4096))
    prompt_dir = Path(os.getenv("PROMPT_DIR", "prompts"))
    output_dir = Path(os.getenv("OUTPUT_DIR", "output"))
    output_dir.mkdir(parents=True, exist_ok=True)
    prompt_renderable = load_prompt_template(prompt_filename, prompt_dir.resolve())
    print("======== Generating prompts =========")
    prompts = [prompt_renderable.render(text=tweet.tweet) for tweet in tweets.tweets]
    print("======== Generating responses =========")
    responses = api_generate(
        prompts,
        model=model_name,
        max_new_tokens=max_tokens,
        tqdm_enabled=True,
        convert_to_text=True,
    )
    print(responses)
    responses = [json.loads(r) for r in responses]
    print("======== Creating claims =========")
    claims: List[str] = []
    tweets_flat: List[str] = []
    sizes: List[int] = []
    for t, resp in zip(tweets.tweets, responses):
        # NOTE: this assumes `claim_extraction2.jinja2` format
        claims.extend([c["claim"] for c in resp])
        tweets_flat.extend([t.tweet for _ in resp])
        sizes.append(len(resp))
    assert all(isinstance(c, str) for c in claims), "Claims must be strings"
    print("======== Creating perplexity prompts =========")
    claim_prompt_template = load_prompt_template(
        "claim_fact_check.jinja2", prompt_dir.resolve()
    )
    claims_prompts = [
        claim_prompt_template.render(claim=c, tweet=t)
        for c, t in zip(claims, tweets_flat)
    ]
    print("======== Querying perplexity =========")
    perplexity_responses = api_generate(
        claims_prompts,
        model="perplexity/sonar-pro",
        max_new_tokens=max_tokens,
        tqdm_enabled=True,
        convert_to_text=False,
    )
    print("======== Creating blocks =========")
    perplexity_responses_blocks = []
    i = 0
    for size in sizes:
        i_start = i
        i_end = i + size
        perplexity_responses_blocks.append(perplexity_responses[i_start:i_end])
        i = i_end
    assert len(perplexity_responses_blocks) == len(sizes) == len(responses) == len(tweets.tweets), f"Lengths must match: {len(perplexity_responses_blocks)} != {len(sizes)} != {len(responses)} != {len(tweets.tweets)}" # fmt: skip
    # print("======== Creating perplexity responses =========")
    # assert all(len(c.choices) == 1 for c in perplexity_responses), "Perplexity responses must have exactly one choice" # fmt: skip
    # perplexity_response_contents = [p.choices[0].message.content for p in perplexity_responses]
    # perplexity_response_citations = [p.choices[0].citations for p in perplexity_responses]
    # perplexity_response_contents = [json.loads(t) for t in perplexity_response_contents]
    # perplexity_response_truth_values = [t["truth_value"] for t in perplexity_response_contents]
    # perplexity_response_explanations = [t["explanation"] for t in perplexity_response_contents]
    outputs = []
    for i, (
        tweet_obj,
        openai_response,
        perplexity_responses_block,
        # perplexity_response_citation,
        # perplexity_response_truth_value,
        # perplexity_response_explanation,
    ) in enumerate(
        zip(
            tweets.tweets,
            responses,
            perplexity_responses_blocks,
            # perplexity_response_citation,
            # perplexity_response_truth_value,
            # perplexity_response_explanation,
        )
    ):
        # print("=" * 50)
        # print(f"Tweet {i+1} of {len(tweets.tweets)}")
        # print("Claims:")
        # print(perplexity_responses_block) # XXX
        truth_values = [
            json.loads(p.choices[0].message.content)["truth_value"]
            for p in perplexity_responses_block
        ]
        explanations = [
            json.loads(p.choices[0].message.content)["explanation"]
            for p in perplexity_responses_block
        ]
        citations = [p.citations[:3] for p in perplexity_responses_block]
        outputs.append(
            {
                "claims": [
                    {
                        "claim": x["claim"],
                        "truthworthiness": truth_values[i],
                        "trustworthiness_explanation": explanations[i],
                        "top3_citations": citations[i][:3],
                    }
                    for i, x in enumerate(openai_response)
                ],
                "tweet": tweet_obj.tweet,
            }
        )
        # assert len(truth_values) == len(openai_response)
        # if len(openai_response) >= 1:
        #     print(
        #         "  - "
        #         + "\n  - ".join(
        #             f'{c["claim"]} ({truth_value}: {explanation})'
        #             for c, truth_value, explanation in zip(openai_response, truth_values, explanations)
        #         )
        #     )
        # else:
        #     print("  No claims found")
        # print("")

        # print(f"Tweet: {tweet_obj.tweet}")
        # print("Citations:")
        # for per_claim in perplexity_responses_block:
        #     print("  Per-claim citations:")
        #     print("    -" + "\n    - ".join(per_claim.citations[:3]))
        # print("=" * 50)
    # Save responses to file
    with open(output_dir / output_filename, "w") as f:
        json.dump(outputs, f, indent=4)


if __name__ == "__main__":
    main()
