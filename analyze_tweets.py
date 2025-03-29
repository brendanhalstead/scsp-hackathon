import os
import json
import logging
from dotenv import load_dotenv
from openai import OpenAI
import openai
import litellm
import pydantic
from typing import List, Dict, Union
from pathlib import Path
from tqdm import tqdm

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
    if tqdm_enabled:
        raise NotImplementedError("tqdm_enabled is not implemented")  # ehhh
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
        for i in range(0, len(prompts), batch_size):
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


if __name__ == "__main__":
    # Configure logging
    logging_enabled = os.getenv("ENABLE_LOGGING", "false").lower() in [
        "true",
        "1",
        "yes",
        "y",
    ]
    log_level = os.getenv("LOG_LEVEL", "info").upper()
    log_dir = Path(os.getenv("LOG_DIR", "logs"))
    log_file_path = log_dir / "api_requests.log"

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

    # XXX
    # Model configuration
    model_name = os.getenv("MODEL_NAME", "gpt-4-turbo")
    max_tokens = int(os.getenv("MAX_TOKENS", 4096))
    responses = api_generate(
        ["Say 'hello' five times then do a somersault"],
        model=model_name,
        max_new_tokens=max_tokens
    )
    print(responses)
