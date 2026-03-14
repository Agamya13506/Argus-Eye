import json
import sys
import os
sys.path.append(os.path.abspath("fraudshield-ml"))
from inference import score_transaction

mlPayload = {
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
    print(score_transaction(mlPayload, skip_explain=True))
except Exception as e:
    import traceback
    traceback.print_exc()

