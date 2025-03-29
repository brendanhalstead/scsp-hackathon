import os
import json
import requests
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()
PERPLEXITY_API_KEY = os.getenv("PERPLEXITY_API_KEY")
MODEL = os.getenv("PERPLEXITY_MODEL", "sonar")
DATA_DIR = Path(os.getenv("DATA_DIR", "data"))
OUTPUT_DIR = Path(os.getenv("OUTPUT_DIR", "output"))

# Define API endpoint for Perplexity (assumed chat API)
PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions"

def check_factuality(claim: str):
    """Sends a factuality-check prompt to Perplexity AI and returns confidence score + sources."""
    headers = {
        "Authorization": f"Bearer {PERPLEXITY_API_KEY}",
        "Content-Type": "application/json"
    }
    
    # Enhanced prompt with explicit citation format requirements
    prompt = (
        "Evaluate the factuality of the following claim. Provide your response in this exact format:\n\n"
        "Claim: [repeat the claim here]\n"
        "Confidence Score: [1, 2, or 3]\n"
        "Explanation: [brief explanation of your evaluation]\n"
        "Sources:\n"
        "- Full citation 1 (include author/organization, title, and URL if available)\n"
        "- Full citation 2\n"
        "(if no sources, just put 'None')\n\n"
        "Important: Always provide complete source citations, not just reference numbers.\n"
        f"Claim to evaluate: '{claim}'"
    )
    
    payload = {
        "model": MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.3
    }
    
    try:
        response = requests.post(PERPLEXITY_API_URL, headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        
        data = response.json()
        content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
        
        # Initialize default values
        score = 1
        sources = []
        explanation = ""
        
        # Parse the structured response
        if "Confidence Score:" in content:
            try:
                score_line = content.split("Confidence Score:")[1].split("\n")[0].strip()
                score = int(score_line[0])  # Get first character (1, 2, or 3)
                score = max(1, min(3, score))  # Ensure score is between 1-3
            except (ValueError, IndexError):
                pass
        
        if "Explanation:" in content:
            explanation = content.split("Explanation:")[1].split("Sources:")[0].strip()
        
        if "Sources:" in content:
            sources_section = content.split("Sources:")[1].strip()
            if sources_section.lower() != "none":
                # Extract all lines after Sources: and clean them up
                sources = [
                    src.strip().lstrip("-").strip() 
                    for src in sources_section.split("\n") 
                    if src.strip() and not src.strip().startswith("[")  # Skip reference numbers
                ]
                # Filter out any remaining empty strings
                sources = [src for src in sources if src]
        
        return score, sources, explanation
    
    except requests.exceptions.RequestException as e:
        print(f"API request failed: {e}")
        return 1, [], "Error during fact check"
    except Exception as e:
        print(f"Unexpected error: {e}")
        return 1, [], "Processing error"

def process_responses(input_file: Path, output_file: Path):
    """Loads JSON responses, checks factuality via Perplexity, and saves results."""
    with open(input_file, "r") as f:
        responses = json.load(f)
    
    results = []
    for response_list in responses:
        if not response_list:
            continue  # Skip empty lists
        
        for claim in response_list:
            score, sources, explanation = check_factuality(claim)
            results.append({
                "claim": claim,
                "confidence_score": score,
                "sources": sources,
                "explanation": explanation
            })
    
    with open(output_file, "w") as f:
        json.dump(results, f, indent=4, ensure_ascii=False)
    
    print(f"Factuality check complete. Results saved to {output_file}")

if __name__ == "__main__":
    input_filepath = Path(OUTPUT_DIR, "entity_extraction_responses.json")
    output_filepath = Path(OUTPUT_DIR, "factuality_check_results.json")
    process_responses(input_filepath, output_filepath)
