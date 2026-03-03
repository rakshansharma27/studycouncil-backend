import asyncio
import httpx
import os
import traceback
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

OPENROUTER_KEY = os.getenv("OPENROUTER_API_KEY")
HEADERS = {
    "Authorization": f"Bearer {OPENROUTER_KEY}",
    "Content-Type": "application/json",
    "HTTP-Referer": "https://studycouncil.vercel.app",
}

COUNCIL_MODELS = [
    "openai/gpt-4o-mini",
    "google/gemini-2.5-flash",
    "anthropic/claude-3-haiku",
    "openrouter/free",  # The ultimate, never-fail free fallback
]
CHAIRMAN = "anthropic/claude-3-haiku"

SYSTEM_PROMPTS = {
    "concept": "You are an expert tutor for students. Explain clearly with one real-world analogy and one exam tip. Max 120 words.",
    "exam": "You are an exam coach. Give 5 likely exam questions, 3 common mistakes, and a 3-point revision summary. Max 150 words.",
    "career": "You are a career counselor. Analyze from your unique angle: job market, skills fit, or future trends. Be specific. Max 130 words.",
}
CHAIRMAN_PROMPT = "You are the Chairman of StudyCouncil. Read the 4 AI tutor responses below. Synthesize ONE perfect answer combining the best points, correcting errors. End with a bold KEY TAKEAWAY sentence. Max 200 words."

class AskRequest(BaseModel):
    question: str
    mode: str = "concept"

async def call_model(client, model, system, question):
    try:
        r = await client.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=HEADERS,
            json={"model": model, "messages": [{"role":"system","content":system},{"role":"user","content":question}], "max_tokens": 350},
            timeout=30
        )
        
        # If OpenRouter rejects the request, return the exact error
        if r.status_code != 200:
            return f"[Error {r.status_code}: {r.text}]"
            
        data = r.json()
        
        # If the structure isn't what we expect, show the raw data
        if "choices" in data:
            return data["choices"][0]["message"]["content"]
        else:
            return f"[API Error: {data}]"
            
    except Exception as e:
        return f"[System Exception for {model.split('/')[1]}: {str(e)}]"

@app.post("/ask")
async def ask(req: AskRequest):
    try:
        system = SYSTEM_PROMPTS.get(req.mode, SYSTEM_PROMPTS["concept"])
        async with httpx.AsyncClient() as client:
            responses = await asyncio.gather(*[call_model(client, m, system, req.question) for m in COUNCIL_MODELS])
            combined = "\n\n".join([f"AI {i+1} ({COUNCIL_MODELS[i].split('/')[1]}): {r}" for i,r in enumerate(responses)])
            synthesis = await call_model(client, CHAIRMAN, CHAIRMAN_PROMPT, f"Question: {req.question}\n\n{combined}")
            
        return {
            "individual": [{"model": COUNCIL_MODELS[i].split("/")[1], "response": r} for i,r in enumerate(responses)],
            "synthesis": synthesis
        }
    except Exception:
        traceback.print_exc()
        return {"error": "Internal server error", "detail": traceback.format_exc()}

@app.get("/health")
def health():
    return {"status": "ok"}