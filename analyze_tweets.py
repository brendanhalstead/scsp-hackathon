import os
import json
import logging
from dotenv import load_dotenv
from openai import OpenAI

import pydantic
from typing import List

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

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging_enabled = os.getenv("ENABLE_LOGGING", "false").lower() == "true"
log_level = os.getenv("LOG_LEVEL", "info").upper()
log_file_path = os.getenv("LOG_FILE_PATH", "logs/api_requests.log")

if logging_enabled:
    # Create logs directory if it doesn't exist
    os.makedirs(os.path.dirname(log_file_path), exist_ok=True)

    # Setup logging configuration
    logging.basicConfig(
        level=getattr(logging, log_level),
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[logging.FileHandler(log_file_path), logging.StreamHandler()],
    )
    logger = logging.getLogger(__name__)
    logger.info("Logging initialized")

# Initialize OpenAI client
client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    organization=os.getenv("OPENAI_ORGANIZATION_ID"),
)

# Model configuration
model_name = os.getenv("MODEL_NAME", "gpt-4-turbo")
max_tokens = int(os.getenv("MAX_TOKENS", 4096))
temperature = float(os.getenv("TEMPERATURE", 0.7))

# Rate limiting configuration
requests_per_minute = int(os.getenv("REQUESTS_PER_MINUTE", 50))
retry_delay_ms = int(os.getenv("RETRY_DELAY_MS", 1000))

print("OpenAI API configuration loaded successfully")
