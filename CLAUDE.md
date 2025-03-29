# CLAUDE.md - Guidelines for AI Safety Project

## Setup & Commands
- **Environment**: `conda env -n <env_name> python=3.12 && conda activate <env_name> && pip install -r requirements.txt`
- **Run tweet analysis**: `python analyze_tweets.py --prompt_filename claim_extraction2.jinja2`
- **Run fact checker**: `python perp_fact_check.py`
- **Enable logging**: Set env var `ENABLE_LOGGING=true LOG_LEVEL=info python analyze_tweets.py ...`

## Code Style
- **Imports**: Group standard lib, third-party, then local; alphabetize within groups
- **Type hints**: Use Python typing module; Pydantic for data models
- **Error handling**: Use try/except with specific exceptions; handle API failures gracefully
- **Naming**: snake_case for variables/functions; CamelCase for classes
- **Documentation**: Docstrings for functions (purpose, args, returns)
- **Environment**: Use .env files with dotenv for configuration
- **Structure**: Use Pydantic models for data validation
- **Templates**: Use Jinja2 for prompt templates in the prompts/ directory

## Data Processing
- Follow the pattern of breaking complex tasks into smaller functions
- When working with API responses, ensure proper parsing and error handling
- Output should be structured for further processing (JSON)