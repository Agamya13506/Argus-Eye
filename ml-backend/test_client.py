from fastapi.testclient import TestClient
from main import app
import traceback

client = TestClient(app)

mlPayload = {
    "txn_id": "live_1",
    "skip_explain": True,
    "amount_inr": 2500,
    "amount_scaled": 0.25,
    "hour": 14,
    "velocity_60s": 22,
    "is_new_device": 1,
    "is_new_recipient": 1,
    "account_age_days": 100,
    "city_risk_score": 0.8,
    "is_festival_day": 0,
    "is_sim_swap_signal": 0,
    "is_round_amount": 1,
    "cat_crypto": 0,
    "cat_grocery": 0,
    "cat_electronics": 0,
    "cat_travel": 0,
    "V14": -20,
    "V4": 6,
    "V12": -15,
    "V10": -12,
    "V11": -6,
}

try:
    response = client.post("/score", json=mlPayload)
    print("STATUS", response.status_code)
    print("RESPONSE", response.json())
except Exception as e:
    traceback.print_exc()
