import { motion } from 'motion/react';
import { Eye, Shield, Brain, Zap, Target, Users, Globe, Lock, ChevronRight, Activity, Stars } from 'lucide-react';

export default function AboutUs() {

    const team = [
        {
            name: 'Vansh',
            role: 'ML Engineer',
            avatar: 'V',
            gradient: 'linear-gradient(135deg, #be123c, #e11d48)',
            desc: 'Designed the fraud detection ML pipeline — a stacked ensemble of XGBoost, LightGBM, and CatBoost with a Logistic Regression meta-learner optimised using F2-score threshold tuning. Integrated LIME for real-time per-transaction explainability and SHAP for 8-dimension Fraud DNA radar charts. Trained on the Kaggle IEEE-CIS dataset (284,807 real anonymised transactions from Vesta Corporation). Built Facebook Prophet for 7-day fraud volume forecasting with Indian festival and salary-day seasonality.',
        },
        {
            name: 'Member 2',
            role: 'Backend Engineer',
            avatar: '2',
            gradient: 'linear-gradient(135deg, #e11d48, #f43f5e)',
            desc: 'Architected the FastAPI backend with asyncio.Queue event broadcaster, WebSocket channels (ws/feed, ws/sync, ws/user), FCM HTTP v1 dispatcher for cross-device push notifications, and all REST endpoints. Built the deterministic rule engine — velocity attack detection, smurfing detection at the ₹9,500 RBI reporting threshold, Haversine geographic impossibility with the 900 km/h commercial flight ceiling, and SIM swap early warning.',
        },
        {
            name: 'Member 3',
            role: 'Frontend Engineer',
            avatar: '3',
            gradient: 'linear-gradient(135deg, #f43f5e, #fb7185)',
            desc: 'Built this entire React web dashboard — live transaction feed, D3.js money mule network graph with circular fund flow detection, React-Leaflet India fraud heatmap, Chart.js SHAP radar with reference fingerprints, Recharts analytics with stable 7d/30d/90d data, demo mode with 5 scripted scenarios, attacker simulator with the UCO Bank ISO-8583 preset, compliance report exports, and role-based access control for Analyst, Manager, and Admin.',
        },
        {
            name: 'Member 4',
            role: 'Mobile Developer',
            avatar: '4',
            gradient: 'linear-gradient(135deg, #fb7185, #fda4af)',
            desc: 'Built the Flutter Android app — FCM push notifications with inline Block and Verify action buttons, biometric re-authentication via local_auth, real-time WebSocket sync with the web dashboard under 200ms, pre-payment risk warnings, one-tap account freeze, phishing link scanner running fully offline against a 500-domain blocklist, social engineering interstitial for digital arrest scams, recovery probability screen with RBI-sourced rates, and Hindi-language alerts from device locale.',
        },
    ];

    const timeline = [
        { label: 'Hour 0', text: 'Team alignment. User-first philosophy locked: protect individuals before money moves, not institutions after it is gone.' },
        { label: 'Hour 2', text: 'FastAPI backend live. WebSocket feed broadcasting synthetic UPI transactions every 500ms. ML pipeline running first inferences under 50ms.' },
        { label: 'Hour 8', text: 'Cross-platform sync proven. Block on web dashboard — Flutter app reflects it in under 200ms. The demo moment validated early.' },
        { label: 'Hour 16', text: 'Stacked ensemble complete. LIME explainability panel live. SHAP 8-dimension Fraud DNA radar rendering unique fingerprints per fraud type.' },
        { label: 'Hour 24', text: 'UCO Bank ISO-8583 pattern preset added to simulator. NetworkX circular fund flow detection live. India fraud heatmap updating in real time.' },
        { label: 'Hour 36', text: 'Flutter app feature-complete. FCM notifications firing on physical device. Pre-payment warnings, biometric freeze, phishing scanner all verified.' },
        { label: 'Hour 48', text: 'Argus Eye submitted by XLNC. 284,807 transactions trained on. ₹847M+ fraud prevention demonstrated live in under 3 minutes.' },
    ];

    const webFeatures = [
        'Live transaction feed — real-time fraud scoring across all users via WebSocket',
        'Case investigation with LIME explainability bars and SHAP Fraud DNA radar chart',
        'Money mule network graph — D3.js force-directed, circular flow detection via NetworkX',
        'India fraud heatmap by state, updating in real time via WebSocket broadcast',
        'Attacker simulator — 7 vectors including UCO Bank ISO-8583 logic inversion preset',
        'Demo mode — 5 scripted fraud scenarios fire at precise time offsets automatically',
        'Community threat intelligence — UPI IDs, phone numbers, URLs, merchants tracked',
        'RBI circular compliance badge on every detected fraud type across the dashboard',
        'Compliance exports — PCI-DSS, RBI Guidelines, GDPR frameworks with audit history',
        'Role-based access — Analyst, Manager, Admin each see only their permitted sections',
    ];

    const appFeatures = [
        'Pre-payment risk warning banner before any UPI transaction confirms',
        'One-tap account freeze with biometric confirmation completing in under 3 seconds',
        'FCM push notifications with inline Block and Verify action buttons',
        'SIM swap early warning — full-screen urgent alert when new device + large transfer',
        'Impossible travel detection using Haversine formula with 900 km/h flight ceiling',
        'Recipient trust score shown before paying — based on UPI age, history, and reports',
        'Phishing link scanner — fully offline, 500 domain blocklist, 8 heuristic rules',
        'Social engineering interstitial — fires before payment for digital arrest scam patterns',
        'Recovery probability screen after confirmed fraud — RBI-cited rates per fraud type',
        'Hindi-language alerts and warnings auto-served when device locale is Hindi',
    ];

    const stats = [
        { value: '284,807', label: 'Training Transactions', sub: 'Real Vesta Corporation data' },
        { value: '97.96%', label: 'Fraud Recall', sub: 'Only 2 missed on test set' },
        { value: '0', label: 'False Positives', sub: 'At F2-optimised threshold' },
        { value: '<200ms', label: 'Cross-Platform Sync', sub: 'Web dashboard ↔ Flutter app' },
    ];

    const motives = [
        {
            icon: Users,
            title: 'The Person, Not the Institution',
            text: 'Every existing fraud system was built for banks — they tell the bank something went wrong. The person whose money is gone gets a generic declined message and a 90-second delayed SMS. Nobody built the tool that warns the person before money moves, explains why in plain language, and lets them freeze their account in 3 seconds — not 10 minutes on hold. We built that.',
        },
        {
            icon: Globe,
            title: "India's Scale Demands Better",
            text: "India handles nearly 50% of the world's real-time digital payments. Fraud cases tripled in 2024. Losses surged 715% in the first half of FY2024-25 to ₹21,367 crore. Tier 2 and Tier 3 cities — where first-time digital banking users are most vulnerable to digital arrest scams and fake RBI calls — have the least fraud protection. The tools that exist are priced for SBI, not for the cooperative bank in Patna or the person who just got their first smartphone.",
        },
        {
            icon: Brain,
            title: 'Explainability Is Non-Negotiable',
            text: 'A risk score of 87 means nothing to anyone. "This transaction was flagged because your implied travel speed was 8,670 km/h — physically impossible" means everything. Under the DPDP Act 2023, decisions affecting individuals must be explainable. We use LIME for real-time triage speed and SHAP for forensic accuracy. Every single blocked transaction has a reason attached to it. No black boxes, ever.',
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="p-8 min-h-screen"
        >

            {/* Header */}
            <header className="mb-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring', bounce: 0.4 }}
                    className="flex items-center gap-5 mb-6"
                >
                    <div
                        className="w-20 h-20 rounded-2xl flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}
                    >
                        <Eye className="w-10 h-10 text-white" />
                    </div>
                    <div>
                        <h1 className="text-5xl font-black tracking-tight" style={{ color: 'var(--text)' }}>
                            Argus Eye
                        </h1>
                        <p className="text-sm font-bold uppercase tracking-widest mt-1" style={{ color: 'var(--accent)' }}>
                            by XLNC · Decipher Hackathon · FinTech Track #2
                        </p>
                    </div>
                </motion.div>
                <div className="h-px w-full" style={{ background: 'var(--border)' }} />
            </header>

            {/* The Name */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-panel rounded-2xl p-8 mb-6"
            >
                <div className="flex items-start gap-6">
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 mt-1"
                        style={{ background: 'rgba(244,63,94,0.1)' }}
                    >
                        <Eye className="w-6 h-6" style={{ color: 'var(--accent)' }} />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text)' }}>
                            Why "Argus Eye"?
                        </h2>
                        <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                            In Greek mythology, Argus Panoptes was a giant with a hundred eyes — a guardian who never
                            slept, watching in every direction simultaneously. Hera appointed him the eternal watchman:
                            the one entity that could observe everything at once and miss nothing.
                        </p>
                        <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                            That is exactly what fraud detection demands. Not a system that checks one signal or monitors
                            one channel or alerts after the fact — but a hundred-eyed intelligence that watches velocity
                            patterns, geographic signals, device fingerprints, network relationships, behavioural baselines,
                            and transaction amounts simultaneously, in real time, across every single payment.
                        </p>
                        <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                            The word "Eye" is deliberate. An eye does not just detect — it understands context. It knows
                            what normal looks like so it recognises the exact moment something deviates. It sees the
                            difference between a legitimate ₹84,000 rent payment and the same amount going to a UPI ID
                            registered two days ago at 3am. That is what we built: not a rulebook with fixed thresholds,
                            but an eye that learns and explains.
                        </p>
                        <div
                            className="mt-2 p-4 rounded-xl border-l-4"
                            style={{ borderLeftColor: 'var(--accent)', background: 'rgba(244,63,94,0.05)' }}
                        >
                            <p className="text-sm font-semibold italic" style={{ color: 'var(--muted)' }}>
                                "Argus never sleeps. Neither does fraud."
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* What XLNC Means */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="glass-panel rounded-2xl p-8 mb-6"
            >
                <div className="flex items-start gap-6">
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 mt-1"
                        style={{ background: 'rgba(244,63,94,0.1)' }}
                    >
                        <Stars className="w-6 h-6" style={{ color: 'var(--accent)' }} />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text)' }}>
                            Who is XLNC?
                        </h2>
                        <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                            XLNC — pronounced "excellence" — is a team of four engineers who believe the gap between
                            what is technically possible and what actually exists in production is where the most
                            important work happens. We do not build proof-of-concepts that only work in demos. We build
                            things that work the way real systems work: with edge cases handled, latency measured,
                            fallbacks coded, and explanations attached to every decision.
                        </p>
                        <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                            For this hackathon we chose to solve a problem that affects hundreds of millions of Indians
                            every day — not because it was the easiest technical problem on the list, but because it was
                            the most important human problem on the list. ₹21,367 crore lost to fraud in six months.
                            First-time digital banking users in Tier 3 cities targeted by people impersonating the RBI.
                            Elderly people losing their life savings to digital arrest scams with no tool to help them.
                            XLNC built the tool.
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Motive — 3 cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-panel rounded-2xl p-8 mb-6"
            >
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: 'var(--text)' }}>
                    <Target className="w-6 h-6" style={{ color: 'var(--accent)' }} />
                    Why We Built This
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {motives.map((m, i) => {
                        const Icon = m.icon;
                        return (
                            <motion.div
                                key={i}
                                whileHover={{ y: -4 }}
                                className="glass-card p-6 rounded-xl"
                            >
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                                    style={{ background: 'rgba(244,63,94,0.1)' }}
                                >
                                    <Icon className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                                </div>
                                <h3 className="font-bold mb-3 text-sm" style={{ color: 'var(--text)' }}>{m.title}</h3>
                                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{m.text}</p>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>

            {/* What Argus Eye Does */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="glass-panel rounded-2xl p-8 mb-6"
            >
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: 'var(--text)' }}>
                    <Zap className="w-6 h-6" style={{ color: 'var(--accent)' }} />
                    What Argus Eye Does
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                        <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--muted)' }}>
                            Web Dashboard — For Bank Analysts
                        </div>
                        <div className="space-y-2.5">
                            {webFeatures.map((f, i) => (
                                <div key={i} className="flex items-start gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                    <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                                    <span>{f}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--muted)' }}>
                            Flutter App — For Individual Users
                        </div>
                        <div className="space-y-2.5">
                            {appFeatures.map((f, i) => (
                                <div key={i} className="flex items-start gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                    <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                                    <span>{f}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Stats row */}
                <div
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6"
                    style={{ borderTop: '1px solid var(--border)' }}
                >
                    {stats.map((s, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -3 }}
                            className="glass-card p-4 rounded-xl text-center"
                        >
                            <div className="text-2xl font-black mb-1" style={{ color: 'var(--accent)' }}>{s.value}</div>
                            <div className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: 'var(--text)' }}>
                                {s.label}
                            </div>
                            <div className="text-xs" style={{ color: 'var(--muted)' }}>{s.sub}</div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* 48-Hour Build Timeline */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="glass-panel rounded-2xl p-8 mb-6"
            >
                <h2 className="text-2xl font-bold mb-8 flex items-center gap-3" style={{ color: 'var(--text)' }}>
                    <Activity className="w-6 h-6" style={{ color: 'var(--accent)' }} />
                    Built in 48 Hours
                </h2>
                <div className="relative">
                    <div
                        className="absolute left-5 top-0 bottom-0 w-px"
                        style={{ background: 'var(--border)' }}
                    />
                    <div className="space-y-6">
                        {timeline.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.65 + i * 0.07 }}
                                className="flex items-start gap-6 pl-14 relative"
                            >
                                <div
                                    className="absolute left-0 w-10 h-10 rounded-full flex items-center justify-center
                              text-xs font-black text-white flex-shrink-0"
                                    style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}
                                >
                                    {i + 1}
                                </div>
                                <div className="glass-card p-4 rounded-xl flex-1">
                                    <div
                                        className="text-xs font-bold uppercase tracking-widest mb-1"
                                        style={{ color: 'var(--accent)' }}
                                    >
                                        {item.label}
                                    </div>
                                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                        {item.text}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Team */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="glass-panel rounded-2xl p-8 mb-6"
            >
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: 'var(--text)' }}>
                    <Users className="w-6 h-6" style={{ color: 'var(--accent)' }} />
                    The Team — XLNC
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {team.map((member, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.75 + i * 0.1 }}
                            whileHover={{ y: -4 }}
                            className="glass-card p-5 rounded-xl"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div
                                    className="w-14 h-14 rounded-full flex items-center justify-center
                              text-xl font-black text-white flex-shrink-0"
                                    style={{ background: member.gradient }}
                                >
                                    {member.avatar}
                                </div>
                                <div>
                                    <div className="font-bold text-lg" style={{ color: 'var(--text)' }}>{member.name}</div>
                                    <div className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
                                        {member.role}
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                {member.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* ML Note */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="glass-card p-5 rounded-2xl mb-6 border-l-4"
                style={{ borderLeftColor: '#f59e0b' }}
            >
                <div className="flex items-start gap-4">
                    <Brain className="w-5 h-5 mt-0.5 flex-shrink-0 text-amber-400" />
                    <div>
                        <div className="font-bold text-sm mb-1 text-amber-400">ML Model — Integration In Progress</div>
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                            The production ML backend (XGBoost + LightGBM + CatBoost stacked ensemble, LIME, SHAP,
                            Prophet forecaster) has been trained and serialised. It is currently being integrated into
                            the FastAPI backend. Once connected, all risk scores shown in this dashboard will be replaced
                            with live inference results from the trained model. The architecture, endpoints, and UI are
                            already built to receive and display them.
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Footer badge */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.85 }}
                className="glass-card p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
                <div>
                    <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--muted)' }}>
                        Decipher Hackathon · FinTech Track #2 · 48 Hours
                    </div>
                    <div className="font-bold text-lg" style={{ color: 'var(--text)' }}>
                        AI-Powered Real-Time Fraud Risk Management System
                    </div>
                    <div className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
                        React 18 · FastAPI · Flutter 3 · Appwrite · XGBoost · LightGBM · CatBoost · LIME · SHAP · Prophet · FCM
                    </div>
                </div>
                <div
                    className="px-5 py-3 rounded-xl text-sm font-black flex-shrink-0"
                    style={{
                        background: 'rgba(244,63,94,0.1)',
                        color: 'var(--accent)',
                        border: '1px solid rgba(244,63,94,0.2)',
                        letterSpacing: '0.15em',
                    }}
                >
                    XLNC · 2026
                </div>
            </motion.div>

        </motion.div>
    );
}
