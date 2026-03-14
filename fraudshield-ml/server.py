import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from inference import score_transaction

app = FastAPI(title="FraudShield ML API")


class ScoreRequest(BaseModel):
    txn_id: str
    skip_explain: bool = False
    # Dynamic payload fields (varies by fraud type)
    velocity_60s: Optional[float] = None
    is_new_device: Optional[int] = None
    hour: Optional[int] = None
    V14: Optional[float] = None
    V12: Optional[float] = None
    v_fraud_signal: Optional[float] = None
    is_sim_swap_signal: Optional[int] = None
    amount_scaled: Optional[float] = None
    cat_crypto: Optional[int] = None
    amount_inr: Optional[float] = None
    is_new_recipient: Optional[int] = None
    account_age_days: Optional[float] = None
    city_risk_score: Optional[float] = None
    is_festival_day: Optional[int] = None
    is_round_amount: Optional[int] = None
    cat_electronics: Optional[int] = None
    cat_grocery: Optional[int] = None
    cat_travel: Optional[int] = None
    V4: Optional[float] = None
    V10: Optional[float] = None
    V11: Optional[float] = None


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "fraudshield-ml",
        "threshold": 0.5,
    }


@app.post("/score")
async def score(payload: ScoreRequest):
    try:
        # Convert payload to dict and filter out None values
        txn_data = {
            k: v
            for k, v in payload.model_dump().items()
            if v is not None and k not in ["txn_id", "skip_explain"]
        }
        result = score_transaction(txn_data, skip_explain=payload.skip_explain)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
