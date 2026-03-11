import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai

# 1. Load the variables from your .env file
load_dotenv()

# 2. Get the key from the environment (This MUST come before you print it)
api_key = os.getenv("GEMINI_API_KEY")

# 3. NOW you can print/use it
print(f"DEBUG: My API key is: {api_key}")

# 4. Configure Gemini



# 3. Configure Gemini using that variable
genai.configure(api_key=api_key)

# 4. Initialize the model
model = genai.GenerativeModel('gemini-1.5-flash')

app = FastAPI()

# 2. Add CORS Middleware (Essential for React to work!)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, you'd limit this to your React URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Report(BaseModel):
    text: str

@app.post("/analyze")
async def analyze_report(report: Report):
    prompt = f"""
    You are an expert Luthier. Analyze the following Tarisio auction condition report.
    Identify any structural 'Red Flags'.
    
    Return the response ONLY in raw JSON format:
    {{
      "risk_score": (1-10),
      "red_flags": [],
      "summary": ""
    }}
    
    Report: {report.text}
    """
    
    try:
        response = model.generate_content(prompt)
        # 1. Get the text
        content = response.text
        # 2. Strip out any markdown blocks if Gemini adds them
        clean_json = content.replace("```json", "").replace("```", "").strip()
        
        # 3. Return as a proper Python dictionary so FastAPI handles the JSON correctly
        import json
        return json.loads(clean_json)
        
    except Exception as e:
        print(f"ERROR: {e}")
        return {"error": str(e)}