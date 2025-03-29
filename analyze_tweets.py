import os
import json
import math
from pathlib import Path
from jinja2 import Environment, FileSystemLoader
import logging
from dotenv import load_dotenv
from openai import OpenAI
import openai
import litellm
from datetime import datetime
import pydantic
from typing import List, Dict, Union
from pathlib import Path
import tqdm

# Load environment variables from .env file
load_dotenv()


class Tweet(pydantic.BaseModel):
    username: str
    handle: str
    timestamp: str
    replying_to: List[str]
    tweet: str


class Tweets(pydantic.BaseModel):
    session_id: str
    retrieved_by: str
    tweets: List[Tweet]


def api_generate(
    prompts: Union[List[str], List[List[Dict[str, str]]]],
    model: str,
    num_retries: int = 4,
    batch_size: int = 16,
    max_new_tokens=128,
    tqdm_enabled: bool = False,  # Nawwww
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
        new_texts = [r.choices[0].message.content for r in responses]

    except openai.OpenAIError as e:
        # Error handling
        should_retry = litellm._should_retry(e.status_code)
        print("Error: API failed to respond.", e, f"should_retry: {should_retry}")
        new_texts = []

    return new_texts


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


def main():
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
    tweets_file_path = data_dir / "tweets_v1.json"
    tweets = Tweets.model_validate_json(tweets_file_path.read_text())  # XXX use this

    # Do a demo where we extract entities from a tweet
    # Model configuration
    model_name = os.getenv("MODEL_NAME", "gpt-4-turbo")
    max_tokens = int(os.getenv("MAX_TOKENS", 4096))
    prompt_dir = Path(os.getenv("PROMPT_DIR", "prompts"))
    output_dir = Path(os.getenv("OUTPUT_DIR", "output"))
    output_dir.mkdir(parents=True, exist_ok=True)
    prompt_renderable = load_prompt_template(
        "entity_extraction.jinja2", prompt_dir.resolve()
    )
    print("Generating prompts...")
    prompts = [prompt_renderable.render(text=tweet.tweet) for tweet in tweets.tweets]
    print("Generating responses...")
    responses = api_generate(
        prompts,
        model=model_name,
        max_new_tokens=max_tokens,
        tqdm_enabled=True,
    )
    responses = [json.loads(r) for r in responses]
    # Save responses to file
    with open(output_dir / "entity_extraction_responses.json", "w") as f:
        json.dump(responses, f, indent=4)


if __name__ == "__main__":
    main()
