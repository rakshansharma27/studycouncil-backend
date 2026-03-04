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
    "HTTP-Referer": "https://studycouncil.aiautomationbyalex.workers.dev",
}

COUNCIL_MODELS = [
    "openai/gpt-4o-mini",
    "google/gemini-2.5-flash",
    "anthropic/claude-3-haiku",
]
CHAIRMAN = "anthropic/claude-3-haiku"

MODEL_NAMES = {
    "openai/gpt-4o-mini":          "GPT-4o Mini",
    "google/gemini-2.5-flash":     "Gemini 2.5 Flash",
    "anthropic/claude-3-haiku":    "Claude 3 Haiku",
}

SYSTEM_PROMPTS = {
    "concept": "You are an expert tutor for students. Explain clearly with one real-world analogy and one exam tip. Max 120 words.",
    "exam":    "You are an exam coach. Analyze any uploaded documents or topic provided. Give 5 likely exam questions, 3 common mistakes, and a 3-point revision summary. Max 150 words.",
    "career":  "You are a career counselor. Analyze from your unique angle: job market, skills fit, or future trends. Be specific. Max 130 words.",
}
CHAIRMAN_PROMPT = "You are the Chairman of StudyCouncil. Read the AI tutor responses below. Synthesize ONE perfect answer combining the best points, correcting errors. End with a bold KEY TAKEAWAY sentence. Max 200 words."

class AskRequest(BaseModel):
    question: str
    mode: str = "concept"

async def call_model(client, model, system, question):
    try:
        r = await client.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=HEADERS,
            json={
                "model": model,
                "messages": [
                    {"role": "system", "content": system},
                    {"role": "user",   "content": question}
                ],
                "max_tokens": 250
            },
            timeout=20
        )
        if r.status_code != 200:
            return f"[{MODEL_NAMES.get(model, model)} is currently unavailable]"
        data = r.json()
        if "choices" in data:
            return data["choices"][0]["message"]["content"]
        return f"[{MODEL_NAMES.get(model, model)} returned an unexpected response]"
    except asyncio.TimeoutError:
        return f"[{MODEL_NAMES.get(model, model)} timed out — try again]"
    except Exception as e:
        return f"[{MODEL_NAMES.get(model, model)} error: {str(e)}]"

@app.post("/ask")
async def ask(req: AskRequest):
    try:
        system = SYSTEM_PROMPTS.get(req.mode, SYSTEM_PROMPTS["concept"])
        async with httpx.AsyncClient() as client:
            responses = await asyncio.gather(
                *[call_model(client, m, system, req.question) for m in COUNCIL_MODELS]
            )
            combined = "\n\n".join([
                f"AI {i+1} ({MODEL_NAMES.get(COUNCIL_MODELS[i], COUNCIL_MODELS[i])}): {r}"
                for i, r in enumerate(responses)
            ])
            synthesis = await call_model(
                client, CHAIRMAN, CHAIRMAN_PROMPT,
                f"Question: {req.question}\n\n{combined}"
            )
        return {
            "individual": [
                {"model": MODEL_NAMES.get(COUNCIL_MODELS[i], COUNCIL_MODELS[i]), "response": r}
                for i, r in enumerate(responses)
            ],
            "synthesis": synthesis
        }
    except Exception:
        traceback.print_exc()
        return {"error": "Internal server error", "detail": traceback.format_exc()}

@app.get("/health")
def health():
    return {"status": "ok", "models": list(MODEL_NAMES.values())}