const ML_BASE = 'http://localhost:8000';

export async function mlFetch(path: string, options?: RequestInit) {
    try {
        const res = await fetch(`${ML_BASE}${path}`, {
            headers: { 'Content-Type': 'application/json' },
            ...options,
        });
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}

const VECTOR_PAYLOADS: Record<string, object> = {
    card_testing: {
        amount_inr: 250, amount_scaled: 0.1, hour: 14,
        velocity_60s: 22, is_new_device: 0, is_new_recipient: 0,
        account_age_days: 400, city_risk_score: 0.3,
        is_festival_day: 0, is_sim_swap_signal: 0, is_round_amount: 0,
        cat_electronics: 0, cat_crypto: 0, cat_grocery: 1,
        V14: -20.0, V4: 6.0, V12: -13.0, V10: -10.0, V11: -5.0,
    },
    velocity: {
        amount_inr: 2500, amount_scaled: 0.9, hour: 3,
        velocity_60s: 23, is_new_device: 1, is_new_recipient: 1,
        account_age_days: 5, city_risk_score: 0.8,
        is_festival_day: 0, is_sim_swap_signal: 0, is_round_amount: 0,
        cat_crypto: 1, cat_grocery: 0, cat_electronics: 0,
        V14: -22.0, V4: 6.5, V12: -15.0, V10: -12.0, V11: -6.0,
    },
    account_takeover: {
        amount_inr: 84000, amount_scaled: 4.2, hour: 3,
        velocity_60s: 1, is_new_device: 1, is_new_recipient: 1,
        account_age_days: 8, city_risk_score: 0.8,
        is_festival_day: 0, is_sim_swap_signal: 1, is_round_amount: 0,
        cat_crypto: 0, cat_grocery: 0, cat_electronics: 1,
        V14: -24.0, V4: 7.0, V12: -18.0, V10: -15.0, V11: -8.0,
    },
    geo_imposter: {
        amount_inr: 84000, amount_scaled: 4.2, hour: 8,
        velocity_60s: 1, is_new_device: 1, is_new_recipient: 0,
        account_age_days: 180, city_risk_score: 0.7,
        is_festival_day: 0, is_sim_swap_signal: 0, is_round_amount: 0,
        cat_crypto: 0, cat_grocery: 0, cat_travel: 1,
        V14: -21.0, V4: 6.0, V12: -14.0, V10: -11.0, V11: -6.0,
    },
    mule: {
        amount_inr: 95000, amount_scaled: 4.5, hour: 22,
        velocity_60s: 8, is_new_device: 0, is_new_recipient: 1,
        account_age_days: 20, city_risk_score: 0.5,
        is_festival_day: 0, is_sim_swap_signal: 0, is_round_amount: 1,
        cat_crypto: 0, cat_grocery: 0, cat_electronics: 0,
        V14: -19.0, V4: 5.5, V12: -12.0, V10: -9.0, V11: -5.0,
    },
    phishing: {
        amount_inr: 50000, amount_scaled: 2.5, hour: 23,
        velocity_60s: 2, is_new_device: 0, is_new_recipient: 1,
        account_age_days: 600, city_risk_score: 0.4,
        is_festival_day: 0, is_sim_swap_signal: 0, is_round_amount: 1,
        cat_crypto: 0, cat_grocery: 0, cat_electronics: 0,
        V14: -18.0, V4: 5.0, V12: -11.0, V10: -8.0, V11: -4.0,
    },
    obvious_fraud: {
        amount_inr: 85000, amount_scaled: 4.2, hour: 3,
        velocity_60s: 25, is_new_device: 1, is_new_recipient: 1,
        account_age_days: 2, city_risk_score: 0.9,
        is_festival_day: 0, is_sim_swap_signal: 1, is_round_amount: 1,
        cat_crypto: 1, cat_grocery: 0, cat_electronics: 0,
        V14: -24.0, V4: 7.0, V12: -18.0, V10: -15.0, V11: -8.0,
    },
    borderline: {
        amount_inr: 45000, amount_scaled: 2.2, hour: 23,
        velocity_60s: 3, is_new_device: 0, is_new_recipient: 1,
        account_age_days: 180, city_risk_score: 0.5,
        is_festival_day: 1, is_sim_swap_signal: 0, is_round_amount: 1,
        cat_crypto: 0, cat_grocery: 0, cat_travel: 1,
        V14: -10.0, V4: 2.0, V12: -5.0, V10: -4.0, V11: -2.0,
    },
    legitimate: {
        amount_inr: 2500, amount_scaled: 0.1, hour: 14,
        velocity_60s: 1, is_new_device: 0, is_new_recipient: 0,
        account_age_days: 900, city_risk_score: 0.1,
        is_festival_day: 0, is_sim_swap_signal: 0, is_round_amount: 0,
        cat_crypto: 0, cat_grocery: 1, cat_electronics: 0,
        V14: 1.0, V4: -1.0, V12: 1.0, V10: 1.0, V11: 0.5,
    },
    uco_bank: {
        amount_inr: 150000, amount_scaled: 6.0, hour: 2,
        velocity_60s: 15, is_new_device: 1, is_new_recipient: 1,
        account_age_days: 3, city_risk_score: 0.9,
        is_festival_day: 0, is_sim_swap_signal: 1, is_round_amount: 1,
        cat_crypto: 1, cat_grocery: 0, cat_electronics: 0,
        V14: -25.0, V4: 8.0, V12: -19.0, V10: -16.0, V11: -9.0,
    },
};

export async function scoreTransaction(
    vectorId: string,
    txnId: string,
    customPayload?: any
): Promise<any | null> {
    const payload = customPayload || VECTOR_PAYLOADS[vectorId];
    if (!payload) return null;
    return mlFetch('/score', {
        method: 'POST',
        body: JSON.stringify({ txn_id: txnId, ...payload }),
    });
}

export async function getExplanation(txnId: string): Promise<any[] | null> {
    return mlFetch(`/explain/${txnId}`);
}

export async function getShap(txnId: string): Promise<any | null> {
    return mlFetch(`/shap/${txnId}`);
}

export async function getForecast(): Promise<any[] | null> {
    return mlFetch('/forecast');
}

export async function getNetworkGraph(accountId: string): Promise<any | null> {
    return mlFetch(`/graph/${accountId}`);
}

export async function getMlHealth(): Promise<any | null> {
    return mlFetch('/health');
}

export async function getTimeline(accountId: string): Promise<any[] | null> {
    return mlFetch(`/timeline/${accountId}`);
}

export async function getRecommendations(caseId: string): Promise<any[] | null> {
    return mlFetch(`/recommend/${caseId}`);
}

export async function retrainModel(
    corrections: { txn_id: string; true_label: number }[]
): Promise<any | null> {
    return mlFetch('/retrain', {
        method: 'POST',
        body: JSON.stringify({ corrections }),
    });
}
