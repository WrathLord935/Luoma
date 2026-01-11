import os
import json
import warnings
from groq import Groq
from dotenv import load_dotenv  # <--- NEW IMPORT
from pydantic import BaseModel, Field
from typing import List

# Suppress warnings
warnings.simplefilter(action='ignore', category=FutureWarning)

# --- 1. SETUP ---
# Load environment variables from the .env file
load_dotenv()

# Get key safely
API_KEY = os.getenv("GROQ_API_KEY")

if not API_KEY:
    raise ValueError("❌ No API Key found! Please check your .env file.")

client = Groq(api_key=API_KEY)

# --- 2. DEFINE THE OUTPUT FORMAT ---
class WashabilityInfo(BaseModel):
    is_machine_washable: bool = Field(description="True if machine wash is safe, False if dry clean/hand wash only")
    max_temperature: str = Field(description="Max temp e.g., '30°C', 'Cold', or 'N/A'")
    care_instructions: str = Field(description="Short care summary (max 1 sentence)")

class Measurement(BaseModel):
    parameter: str = Field(description="Name of measurement (e.g. Waist, Length)")
    value_cm: float
    value_in: float

class ColorInfo(BaseModel):
    name: str
    hex_code: str

class UpcycleSuggestion(BaseModel):
    new_item_name: str
    feasibility_score: int
    description: str = Field(description="Mini description of the new item")
    step_by_step_instructions: List[str] = Field(
        description="List of instructions. Max 10 steps total. Each step must be 2 sentences MAX."
    )

class DressAnalysis(BaseModel):
    cloth_name: str
    material_type: str
    washability: WashabilityInfo 
    measurements: List[Measurement]
    colors: List[ColorInfo]
    upcycle_ideas: List[UpcycleSuggestion]

# Helper for Groq Schema
json_schema_str = json.dumps(DressAnalysis.model_json_schema(), indent=2)

# --- 3. THE ANALYZE FUNCTION ---
def analyze_text(text_input: str):
    try:
        print("--- GROQ AI IS THINKING... ---")
        
        chat_completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile", 
            response_format={"type": "json_object"}, 
            messages=[
                {
                    "role": "system",
                    "content": f"""
                    You are a Technical Fashion Designer and Laundry Care Expert. 
                    Analyze the marketplace listing description.
                    
                    REQUIRED OUTPUTS:
                    1. **Cloth Name:** Identify the specific item.
                    2. **Material Type:** Extract fabric.
                    3. **Colors:** Extract colors.
                    4. **Washability:** Analyze the fabric type.
                    5. **Measurements:** Extract exact measurements.
                    6. **Upcycling:** Suggest 3 distinct ideas.
                    
                    CRITICAL RULES FOR INSTRUCTIONS:
                    - CONSTRAINT 1: Minimum 10 steps total.
                    - CONSTRAINT 2: Each individual step must be SHORT (Maximum 2 sentences).

                    OUTPUT FORMAT:
                    You must output valid JSON matching this schema exactly:
                    {json_schema_str}
                    """
                },
                {
                    "role": "user",
                    "content": text_input
                }
            ],
            temperature=0.1, 
        )

        response_text = chat_completion.choices[0].message.content
        return json.loads(response_text)

    except Exception as e:
        return {"error": str(e)}

# --- 4. UTILITY: AUTO-INCREMENT FILENAME ---
def get_unique_filename(base_name):
    if not os.path.exists(base_name):
        return base_name
    name, ext = os.path.splitext(base_name)
    counter = 1
    while True:
        new_name = f"{name}_{counter}{ext}"
        if not os.path.exists(new_name):
            return new_name
        counter += 1

# --- 5. EXECUTION ---
if __name__ == "__main__":
    
    # --- INPUT ---
    raw_user_input = input('Enter Description:\n\t')#"""Gently used men’s cotton T-shirt in excellent condition with no tears, stains, or damage. Size L with a regular fit that sits comfortably for daily wear. Made from 100% cotton, offering good breathability and softness."""

    print(f"Analyzing Listing: {raw_user_input[:50]}...")
    
    result_data = analyze_text(raw_user_input)

    final_output = {
        "original_user_input": raw_user_input, 
        "ai_analysis": result_data
    }

    base_filename = "dress_analysis.json"
    safe_filename = get_unique_filename(base_filename)

    with open(safe_filename, "w") as f:
        json.dump(final_output, f, indent=4)
        
    print(f"\n✅ Success! Data saved to '{safe_filename}'")
