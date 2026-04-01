from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import itertools
import os
import json
import asyncio
from openai import AsyncOpenAI

NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY")

if not NVIDIA_API_KEY:
    raise ValueError("API KEY MISSING")

client = AsyncOpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key=NVIDIA_API_KEY
)

app = FastAPI(title="Medicine Interaction Checker & AI Assistant API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Backend is running with NVIDIA AI"}

class ChatRequest(BaseModel):
    message: str
    model_version: Optional[str] = "v2" # v1 Basic, v2 Advanced, v3 Pro

class ChatResponse(BaseModel):
    reply: str

class InteractionResult(BaseModel):
    drug1: str
    drug2: str
    severity: str
    recommendation: str

class DrugCheckResponse(BaseModel):
    results: List[InteractionResult]

INTERACTION_RULES = {
    frozenset(["aspirin", "ibuprofen"]): {
        "severity": "High",
        "recommendation": "Avoid combination. Increases risk of GI bleeding."
    },
    frozenset(["warfarin", "aspirin"]): {
        "severity": "Severe",
        "recommendation": "Significantly increases the risk of serious bleeding complications."
    },
    frozenset(["paracetamol", "cetirizine"]): {
        "severity": "Low",
        "recommendation": "Generally safe to use together for short terms."
    }
}

@app.post("/check", response_model=DrugCheckResponse)
def check_interactions(drugs: List[str]):
    results = []
    cleaned_drugs = [drug.lower().strip() for drug in drugs]
    
    for drug1, drug2 in itertools.combinations(cleaned_drugs, 2):
        pair_set = frozenset([drug1, drug2])
        if pair_set in INTERACTION_RULES:
            rule = INTERACTION_RULES[pair_set]
            results.append(
                InteractionResult(
                    drug1=drug1,
                    drug2=drug2,
                    severity=rule["severity"],
                    recommendation=rule["recommendation"]
                )
            )
            
    return {"results": results}

def classify_intent(user_input: str, history: List[dict]):
    """
    Layer 1: Intent Classifier
    Categorize query into greeting, medical, followup, or general.
    """
    text = user_input.lower().strip()
    
    # Greeting detection
    greetings = {"hi", "hello", "hey", "good morning", "good afternoon", "good evening"}
    if text in greetings:
        return "greeting"

    # Follow-up detection (searching for pronouns or connecting phrases)
    followup_hints = {"what about", "and this", "then", "tell me more", "what else", "how about", "why is that"}
    if any(hint in text for hint in followup_hints) and len(history) > 0:
        return "followup"

    # Medical keywords
    medical_keywords = {
        "fever", "pain", "headache", "symptom", "medicine", "doctor", "health", 
        "disease", "cure", "treatment", "virus", "infection", "clinical", 
        "hospital", "patient", "drug", "blood", "heart", "brain", 
        "cough", "stomach", "rash", "allergy", "flu", "cold", "covid"
    }
    if any(word in text for word in medical_keywords):
        return "medical"

    return "general"

@app.post("/chat")
async def chat(data: dict):
    user_input = data.get("message", "").strip()
    history = data.get("history", [])

    if not user_input:
        return {"reply": "No input provided"}

    print("INPUT:", user_input)

    intent = classify_intent(user_input, history)

    # Greeting shortcut
    if intent == "greeting":
        return {"reply": "Hello 👋 How can I help you today?"}

    # Context handling
    if intent == "followup":
        mapped_history = []
        for m in history[-2:]:
            role = "assistant" if m.get("role") == "ai" else "user"
            mapped_history.append({
                "role": role,
                "content": m.get("content")
            })
    else:
        mapped_history = []

    # Prompt
    if intent == "medical":
        sys_prompt = f"""
You are a professional medical AI.

Give structured response:
- Summary
- Causes
- Precautions
- Steps
- Medicines
- When to see doctor

User: {user_input}
"""
    else:
        sys_prompt = f"""
You are a helpful assistant.

Answer clearly and concisely.

User: {user_input}
"""

    # 🔥 10s HARD TIMEOUT
    try:
        completion = await asyncio.wait_for(
            client.chat.completions.create(
                model="meta/llama3-8b-instruct",
                messages=mapped_history + [
                    {"role": "system", "content": sys_prompt}
                ],
                temperature=0.2,
                max_tokens=200
            ),
            timeout=10
        )

        reply = completion.choices[0].message.content

        if not reply:
            reply = "I couldn't generate a response. Try again."

        return {"reply": reply}

    except Exception as e:
        print("🔥 ERROR:", str(e))
        return {"reply": "AI server issue. Please try again in a moment."}



@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Basic placeholder endpoint that accepts file uploads (image/pdf)
    and returns a mock analysis result.
    """
    try:
        # Here we would normally save the file and process it with OCR or pass it to Gemini Vision.
        # For this template, we return a mock success message.
        file_size = len(await file.read())
        return {
            "reply": f"File '{file.filename}' ({file_size} bytes) successfully processed. \n\n### Document Analysis\n- Document parsed successfully.\n- Detected medical jargon indicating a typical lab test report.\n- No critical abnormalities flagged directly by initial scan. Please ask specific questions about the document in the chat."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
