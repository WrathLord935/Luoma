import os
import json
import warnings
from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from typing import List

# Suppress warnings
warnings.simplefilter(action='ignore', category=FutureWarning)

# --- CONFIGURATION ---
load_dotenv()
API_KEY = os.getenv("GROQ_API_KEY")

if not API_KEY:
    print("❌ WARNING: No GROQ_API_KEY found in .env")

app = Flask(__name__)
# Enable CORS for all routes, allowing requests from localhost:5173/5174
CORS(app) 

client = Groq(api_key=API_KEY)

# --- Pydantic Models for Schema ---
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

# Generate Schema String
json_schema_str = json.dumps(DressAnalysis.model_json_schema(), indent=2)

@app.route('/analyze', methods=['POST'])
def analyze_endpoint():
    try:
        data = request.json
        description = data.get('description', '')

        if not description:
            return jsonify({"error": "No description provided"}), 400

        print(f"Analyzing: {description[:50]}...")

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
                    "content": description
                }
            ],
            temperature=0.1, 
        )

        response_text = chat_completion.choices[0].message.content
        result_json = json.loads(response_text)
        
        return jsonify(result_json)

    except Exception as e:
        print(f"Server Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("AI Backend running on http://localhost:5000")
    app.run(port=5000, debug=True)
