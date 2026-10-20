from fastapi import FastAPI, Header, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv
import os
import secrets
import time

from model.symptom_extractor import extract_symptoms_from_text, combine_symptoms
from model.predict import predict_diseases

#load ML_SERVICE_TOKEN from services/ml/.env, must match the backend's token
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env'))
ML_SERVICE_TOKEN = os.environ.get("ML_SERVICE_TOKEN")
if not ML_SERVICE_TOKEN:
    raise RuntimeError("ML_SERVICE_TOKEN is not set, copy .env.example to .env")

app = FastAPI()

#only accept requests from the backend, checks the bearer token
def verify_token(authorization: Optional[str] = Header(None)):
    expected = f"Bearer {ML_SERVICE_TOKEN}"
    if not authorization or not secrets.compare_digest(authorization.encode(), expected.encode()):
        raise HTTPException(status_code=401, detail="Invalid or missing token")

class PredictRequest(BaseModel):
    free_text: Optional[str] = ""
    structured_symptoms: Optional[list] = []

@app.get("/health")
def health():
    return {"status": "ok", "service": "mediq-ml-v1.0.0"}

@app.post("/predict")
def predict(body: PredictRequest, _: None = Depends(verify_token)):
    start = time.time()

    #extract sympoyms from free text
    text_symptoms = extract_symptoms_from_text(body.free_text)

    #combine with the structured sympomtoms, remove dupes, filter to known symmptoms
    all_symptoms = combine_symptoms(text_symptoms, list(body.structured_symptoms or []))

    #run rf prediciton
    predictions = predict_diseases(all_symptoms)

    #format res
    formatted = []
    for pred in predictions:
        formatted.append({
            "condition_id": None,
            "condition_name": pred["condition_name"],
            "confidence": pred["confidence"],
            "rank": pred["rank"],
            "matched_symptoms": pred["matched_symptoms"],
            "explanation": f"Matched {len(pred['matched_symptoms'])} symptom(s)"
        })

    elapsed = round((time.time() - start) * 1000)

    return {
        "model_version": "1.0.0",
        "predictions": formatted,
        "processing_ms": elapsed
    }