import pandas as pd
import numpy as np
import joblib
import json
import time
import os
import shap
import dill
from lime.lime_tabular import LimeTabularExplainer

# Load models and assets ONCE at module import
MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")


def load_json(filename):
    with open(os.path.join(MODEL_DIR, filename), "r") as f:
        return json.load(f)


# Base Models
model_xgb = joblib.load(os.path.join(MODEL_DIR, "xgb_fraud_scorer.pkl"))
model_lgb = joblib.load(os.path.join(MODEL_DIR, "lgb_fraud_scorer.pkl"))
model_cat = joblib.load(os.path.join(MODEL_DIR, "cat_fraud_scorer.pkl"))

# Meta & Supporting Models
meta_learner = joblib.load(os.path.join(MODEL_DIR, "meta_learner.pkl"))
model_rf_type = joblib.load(os.path.join(MODEL_DIR, "rf_fraud_type.pkl"))

# Explainers
explainer_shap = joblib.load(os.path.join(MODEL_DIR, "shap_explainer.pkl"))
with open(os.path.join(MODEL_DIR, "lime_explainer.pkl"), "rb") as f:
    explainer_lime = dill.load(f)

# Transformers & Config
robust_scaler = joblib.load(os.path.join(MODEL_DIR, "robust_scaler.pkl"))
FEATURES = load_json("features.json")
SHAP_8D = load_json("shap_8d_map.json")
THRESHOLD_DATA = load_json("threshold.json")
THRESHOLD = THRESHOLD_DATA["threshold"]


def convert_to_native(obj):
    """Convert numpy types to native Python types for JSON serialization"""
    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, dict):
        return {k: convert_to_native(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_to_native(i) for i in obj]
    return obj


def score_transaction(txn: dict, skip_explain: bool = False) -> dict:
    import time

    t_start = time.time()

    # 1. Preprocess - fill missing features with 0
    row_dict = {f: txn.get(f, 0) for f in FEATURES}
    row = pd.DataFrame([row_dict])[FEATURES].fillna(0)

    # 2. Get probability from each model
    p_xgb = model_xgb.predict_proba(row)[0][1]
    p_lgb = model_lgb.predict_proba(row)[0][1]
    p_cat = model_cat.predict_proba(row)[0][1]

    # 3. Weighted ensemble (XGB 40%, LGB 35%, CAT 25%)
    score = 0.40 * p_xgb + 0.35 * p_lgb + 0.25 * p_cat

    is_fraud = bool(score >= THRESHOLD)
    risk_level = "HIGH" if score > 0.75 else "MEDIUM" if score > 0.40 else "LOW"

    # 4. Fraud type (only if is_fraud=True)
    fraud_type = None
    if is_fraud:
        fraud_type = str(convert_to_native(model_rf_type.predict(row)[0]))

    # 5. LIME & SHAP - only if not skipped
    if skip_explain:
        lime_reasons = []
        shap_8d = {}
    else:
        try:
            # LIME — top 4 risk-increasing reasons only
            lime_exp = explainer_lime.explain_instance(
                row.values[0], model_xgb.predict_proba, num_features=4
            )
            lime_reasons = [
                {
                    "feature": f,
                    "weight": round(float(w), 4),
                    "direction": "RISK" if w > 0 else "SAFE",
                }
                for f, w in lime_exp.as_list()
                if w > 0
            ]
        except Exception as e:
            lime_reasons = []

        try:
            # SHAP 8D aggregation
            raw_shap = explainer_shap.shap_values(row)
            if isinstance(raw_shap, list):
                raw_shap = raw_shap[1][0]  # Positive class, first row
            else:
                raw_shap = raw_shap[0]  # Single row
            shap_dict = dict(zip(FEATURES, raw_shap))
            shap_8d = {
                dim: round(float(sum(shap_dict.get(f, 0) for f in feats)), 4)
                for dim, feats in SHAP_8D.items()
            }
        except Exception as e:
            shap_8d = {}

    inference_ms = round((time.time() - t_start) * 1000, 1)

    # 7. Return
    return {
        "score": round(score * 100, 1),  # 0-100
        "raw_proba": round(score, 4),
        "is_fraud": is_fraud,
        "risk_level": risk_level,
        "fraud_type": fraud_type,
        "model_breakdown": {
            "xgb": round(p_xgb, 4),
            "lgb": round(p_lgb, 4),
            "cat": round(p_cat, 4),
        },
        "lime": lime_reasons,
        "shap_8d": shap_8d,
        "inference_ms": inference_ms,
    }

    inference_ms = round((time.time() - t_start) * 1000, 1)

    # 7. Return
    return {
        "score": round(score * 100, 1),  # 0-100
        "raw_proba": round(score, 4),
        "is_fraud": is_fraud,
        "risk_level": risk_level,
        "fraud_type": fraud_type,
        "model_breakdown": {
            "xgb": round(p_xgb, 4),
            "lgb": round(p_lgb, 4),
            "cat": round(p_cat, 4),
        },
        "lime": lime_reasons,
        "shap_8d": shap_8d,
        "inference_ms": inference_ms,
    }


if __name__ == "__main__":
    print(f"Loaded FraudShield ML Inference Engine. Threshold: {THRESHOLD:.4f}")

    # Manual Smoke Tests

    # Test 1 — obvious fraud (high velocity, new device, 3am)
    txn_fraud = {
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

    # Test 2 — obvious legit (low velocity, known device, 2pm)
    txn_legit = {
        "velocity_60s": 0.5,
        "is_new_device": 0,
        "hour": 14,
        "V14": 0.5,
        "V12": 0.8,
        "v_fraud_signal": -0.5,
        "amount_scaled": 0.2,
        "is_new_recipient": 0,
    }

    # Test 3 — borderline (medium signals)
    txn_borderline = {
        "velocity_60s": 4.5,
        "is_new_device": 1,
        "hour": 10,
        "V14": -1.2,
        "v_fraud_signal": 0.5,
        "amount_scaled": 1.1,
        "is_new_recipient": 1,
    }

    for i, txn in enumerate([txn_fraud, txn_legit, txn_borderline], 1):
        print(f"\n--- Smoke Test {i} ---")
        res = score_transaction(txn)
        print(f"Score   : {res['score']}")
        print(f"Is Fraud: {res['is_fraud']}")
        print(f"Level   : {res['risk_level']}")
        if res["is_fraud"]:
            print(f"Type    : {res['fraud_type']}")
        print(f"Latency : {res['inference_ms']}ms")
        print(f"SHAP 8D : {res['shap_8d']}")
