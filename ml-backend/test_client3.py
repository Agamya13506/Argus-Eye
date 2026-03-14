from fastapi.testclient import TestClient
from main import app
import traceback

client = TestClient(app)

mlPayload = {
    "txn_id": "live_2",
    "skip_explain": True,
    "velocity_60s": 22.5,
    "is_new_device": 1,
    "hour": 3,
    "V14": -5.5,
    "V12": -4.0,
    "v_fraud_signal": 2.5,
    "is_sim_swap_signal": 1,
    "amount_scaled": 2.5,
    "cat_crypto": 1,
}

try:
    response = client.post("/score", json=mlPayload)
    print("STATUS", response.status_code)
    print("RESPONSE", response.json() if response.status_code == 200 else response.text)
except Exception as e:
    traceback.print_exc()
