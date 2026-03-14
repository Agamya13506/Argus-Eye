from fastapi.testclient import TestClient
from main import app
import traceback

client = TestClient(app)

mlPayload = {
    "txn_id": "live_2",
    "skip_explain": True,
    "amount_inr": 85000,
    "amount_scaled": 8.5,
    "hour": 3,
    "velocity_60s": 50,
    "is_new_device": 1,
    "is_new_recipient": 1,
    "account_age_days": 2,
    "city_risk_score": 0.9,
    "cat_crypto": 1,
    "V14": -25,
    "V4": 8,
    "V12": -20,
    "V10": -18,
    "V11": -9,
}

try:
    response = client.post("/score", json=mlPayload)
    print("STATUS", response.status_code)
    print("RESPONSE", response.json() if response.status_code == 200 else response.text)
except Exception as e:
    traceback.print_exc()
