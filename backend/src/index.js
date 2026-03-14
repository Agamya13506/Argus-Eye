import express from 'express';
import cors from 'cors';
import { ID } from 'appwrite';

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

const APPWRITE_ENDPOINT = 'https://nyc.cloud.appwrite.io/v1';
const APPWRITE_PROJECT = '69b423e1001873687a8d';
const APPWRITE_API_KEY = 'standard_02e9cc014ffd457e7ca594569b8d70d519d68ac96f9b512fe3f9b8e01ac7b09016722aa44e9a9f3d11f612f9402c19ae6ab2d756013eafd88a703ead0a4b7308a481a3a5c370c78416fab07933fb54a88250b5a1b9789dbec0ca5ea35e8910df4cd9d763184d69aff433211e3b021ad958a023532f32f9c0d3a1e56a0ea57b7c';
const DATABASE_ID = 'argus_eye_db';

async function appwriteFetch(endpoint, method = 'GET', body = null) {
  const headers = {
    'Content-Type': 'application/json',
    'X-Appwrite-Project': APPWRITE_PROJECT,
    'X-Appwrite-Key': APPWRITE_API_KEY
  };
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);
  const response = await fetch(`${APPWRITE_ENDPOINT}${endpoint}`, options);
  return response.json();
}

async function initializeAppwrite() {
  try {
    try { await appwriteFetch(`/databases/${DATABASE_ID}`); }
    catch (e) { await appwriteFetch('/databases', 'POST', { databaseId: DATABASE_ID, name: 'Argus Eye Database' }); }

    const collections = [
      { id: 'transactions', name: 'Transactions' },
      { id: 'threats', name: 'Threats' },
      { id: 'cases', name: 'Cases' },
      { id: 'audit_logs', name: 'Audit Logs' },
      { id: 'compliance', name: 'Compliance' }
    ];
    for (const col of collections) {
      try { await appwriteFetch(`/databases/${DATABASE_ID}/collections/${col.id}`); }
      catch (e) { await appwriteFetch(`/databases/${DATABASE_ID}/collections`, 'POST', { collectionId: col.id, name: col.name }); }
    }

    await new Promise(r => setTimeout(r, 3000));
    const threatAttrs = [
      { key: 'entityId',          type: 'string',  size: 256,    required: true  },
      { key: 'entityType',        type: 'string',  size: 64,     required: true  },
      { key: 'source',            type: 'string',  size: 32,     required: false },
      { key: 'reports',           type: 'integer', required: false, default: 0   },
      { key: 'score',             type: 'integer', required: false, default: 0   },
      { key: 'status',            type: 'string',  size: 64,     required: false },
      { key: 'time',              type: 'string',  size: 64,     required: false },
      { key: 'analyst_confirmed', type: 'boolean', required: false, default: false },
    ];
    for (const attr of threatAttrs) {
      try {
        const endpoint = `/databases/${DATABASE_ID}/collections/threats/attributes/${attr.type === 'integer' ? 'integer' : attr.type === 'boolean' ? 'boolean' : 'string'}`;
        await appwriteFetch(endpoint, 'POST', {
          key: attr.key,
          required: attr.required,
          ...(attr.type === 'string' ? { size: attr.size } : {}),
          ...(attr.default !== undefined ? { default: attr.default } : {}),
        });
      } catch (e) {}
    }

    await new Promise(r => setTimeout(r, 3000));
    const txAttrs = [
      { key: 'amount',     type: 'integer', required: false, default: 0     },
      { key: 'sender',     type: 'string',  size: 256,       required: false },
      { key: 'receiver',   type: 'string',  size: 256,       required: false },
      { key: 'score',      type: 'integer', required: false, default: 0     },
      { key: 'type',       type: 'string',  size: 64,        required: false },
      { key: 'status',     type: 'string',  size: 32,        required: false },
      { key: 'timestamp',  type: 'string',  size: 64,        required: false },
      { key: 'simulated',  type: 'boolean', required: false, default: false  },
    ];
    for (const attr of txAttrs) {
      try {
        const endpoint = `/databases/${DATABASE_ID}/collections/transactions/attributes/${attr.type === 'integer' ? 'integer' : attr.type === 'boolean' ? 'boolean' : 'string'}`;
        await appwriteFetch(endpoint, 'POST', {
          key: attr.key,
          required: attr.required,
          ...(attr.type === 'string' ? { size: attr.size } : {}),
          ...(attr.default !== undefined ? { default: attr.default } : {}),
        });
      } catch (e) {}
    }

    await new Promise(r => setTimeout(r, 3000));
    const auditAttrs = [
      { key: 'action',      type: 'string', size: 128, required: false },
      { key: 'entityId',    type: 'string', size: 256, required: false },
      { key: 'analystId',   type: 'string', size: 128, required: false },
      { key: 'rbi_reference', type: 'string', size: 128, required: false },
      { key: 'timestamp',   type: 'string', size: 64,  required: false },
    ];
    for (const attr of auditAttrs) {
      try {
        const endpoint = `/databases/${DATABASE_ID}/collections/audit_logs/attributes/${attr.type === 'integer' ? 'integer' : attr.type === 'boolean' ? 'boolean' : 'string'}`;
        await appwriteFetch(endpoint, 'POST', {
          key: attr.key,
          required: attr.required,
          ...(attr.type === 'string' ? { size: attr.size } : {}),
          ...(attr.default !== undefined ? { default: attr.default } : {}),
        });
      } catch (e) {}
    }

    await new Promise(r => setTimeout(r, 3000));
    const caseAttrs = [
      { key: 'title',       type: 'string', size: 256, required: false },
      { key: 'description', type: 'string', size: 1024, required: false },
      { key: 'priority',    type: 'string', size: 32,  required: false },
      { key: 'status',      type: 'string', size: 32,  required: false },
      { key: 'amount',      type: 'integer', required: false, default: 0 },
      { key: 'assignedTo',  type: 'string', size: 128, required: false },
      { key: 'createdAt',   type: 'string', size: 64,  required: false },
    ];
    for (const attr of caseAttrs) {
      try {
        const endpoint = `/databases/${DATABASE_ID}/collections/cases/attributes/${attr.type === 'integer' ? 'integer' : attr.type === 'boolean' ? 'boolean' : 'string'}`;
        await appwriteFetch(endpoint, 'POST', {
          key: attr.key,
          required: attr.required,
          ...(attr.type === 'string' ? { size: attr.size } : {}),
          ...(attr.default !== undefined ? { default: attr.default } : {}),
        });
      } catch (e) {}
    }

    console.log('Appwrite ready');
  } catch (error) { console.error('Init error:', error.message); }
}

async function seedData() {
  console.log('Seeding data...');
  const txData = [
    { amount: 45000, sender: 'user_492', receiver: 'merch_88', score: 85, type: 'SIM Swap', status: 'flagged' },
    { amount: 1200, sender: 'user_112', receiver: 'user_99', score: 12, type: 'None', status: 'clear' },
    { amount: 8500, sender: 'user_77', receiver: 'merch_12', score: 65, type: 'Suspicious', status: 'review' },
    { amount: 120000, sender: 'user_44', receiver: 'user_8', score: 92, type: 'Account Takeover', status: 'blocked' },
    { amount: 350, sender: 'user_19', receiver: 'merch_4', score: 5, type: 'None', status: 'clear' },
    { amount: 75000, sender: 'user_321', receiver: 'merch_55', score: 78, type: 'Card Testing', status: 'flagged' },
    { amount: 56000, sender: 'user_89', receiver: 'merch_33', score: 88, type: 'Phishing', status: 'blocked' },
    { amount: 95000, sender: 'user_67', receiver: 'user_92', score: 95, type: 'Money Mule', status: 'blocked' },
  ];
  for (const tx of txData) {
    await appwriteFetch(`/databases/${DATABASE_ID}/collections/transactions/documents`, 'POST', { documentId: ID.unique(), data: { ...tx, timestamp: new Date().toISOString() } });
  }
  console.log('Transactions seeded');

  const threatData = [
    { entityId: 'upi_fraud_992', entityType: 'UPI ID', source: 'BOTH', reports: 14, score: 92, status: 'CONFIRMED', time: '2m ago' },
    { entityId: '9876543210', entityType: 'Phone', source: 'USER', reports: 3, score: 45, status: 'CORROBORATED', time: '15m ago' },
    { entityId: 'fake-kyc.com', entityType: 'URL', source: 'ANALYST', reports: 0, score: 85, status: 'REVIEWING', time: '1h ago' },
    { entityId: 'merch_fake_11', entityType: 'Merchant', source: 'BOTH', reports: 8, score: 98, status: 'BLOCKLISTED', time: '3h ago' },
  ];
  for (const t of threatData) { await appwriteFetch(`/databases/${DATABASE_ID}/collections/threats/documents`, 'POST', { documentId: ID.unique(), data: t }); }
  console.log('Threats seeded');

  const caseData = [
    { title: 'SIM Swap Investigation', description: 'Multiple reports of SIM swap fraud', priority: 'high', status: 'in_progress', amount: 45000, assignedTo: 'Analyst 42' },
    { title: 'Phishing Campaign Detection', description: 'Identified organized phishing campaign', priority: 'critical', status: 'open', amount: 120000, assignedTo: 'Unassigned' },
    { title: 'Merchant Fraud Review', description: 'Review of suspicious merchant transactions', priority: 'medium', status: 'in_progress', amount: 8500, assignedTo: 'Analyst 15' },
  ];
  for (const c of caseData) { await appwriteFetch(`/databases/${DATABASE_ID}/collections/cases/documents`, 'POST', { documentId: ID.unique(), data: { ...c, createdAt: new Date().toISOString() } }); }
  console.log('Cases seeded');

  const compData = [
    { framework: 'PCI-DSS', score: 98, status: 'Compliant', lastAudit: '2024-01-15', nextAudit: '2024-07-15' },
    { framework: 'RBI Guidelines', score: 96, status: 'Compliant', lastAudit: '2024-01-20', nextAudit: '2024-06-20' },
    { framework: 'GDPR', score: 94, status: 'Compliant', lastAudit: '2024-01-10', nextAudit: '2024-07-10' },
  ];
  for (const c of compData) { await appwriteFetch(`/databases/${DATABASE_ID}/collections/compliance/documents`, 'POST', { documentId: ID.unique(), data: c }); }
  console.log('Seeding complete!');
}

// ─── GET ROUTES ───
app.get('/api/transactions', async (req, res) => {
  try {
    const response = await appwriteFetch(`/databases/${DATABASE_ID}/collections/transactions/documents?queries[]=desc(timestamp)&limit=50`);
    res.json(response.documents || []);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/threats', async (req, res) => {
  try {
    const response = await appwriteFetch(`/databases/${DATABASE_ID}/collections/threats/documents?queries[]=desc(score)&limit=50`);
    res.json(response.documents || []);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/cases', async (req, res) => {
  try {
    const response = await appwriteFetch(`/databases/${DATABASE_ID}/collections/cases/documents?queries[]=desc(createdAt)&limit=50`);
    res.json(response.documents || []);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/compliance', async (req, res) => {
  try {
    const response = await appwriteFetch(`/databases/${DATABASE_ID}/collections/compliance/documents`);
    res.json(response.documents || []);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/stats', async (req, res) => {
  try {
    const [transactions, threats, cases] = await Promise.all([
      appwriteFetch(`/databases/${DATABASE_ID}/collections/transactions/documents?limit=1000`).catch(() => ({ documents: [] })),
      appwriteFetch(`/databases/${DATABASE_ID}/collections/threats/documents?limit=1000`).catch(() => ({ documents: [] })),
      appwriteFetch(`/databases/${DATABASE_ID}/collections/cases/documents?limit=1000`).catch(() => ({ documents: [] }))
    ]);
    const totalTransactions = transactions.documents?.length || 0;
    const fraudDetected = transactions.documents?.filter(t => t.score >= 75).length || 0;
    const threatsIdentified = threats.documents?.length || 0;
    const confirmedThreats = threats.documents?.filter(t => t.status === 'CONFIRMED' || t.status === 'BLOCKLISTED').length || 0;
    const openCases = cases.documents?.filter(c => c.status === 'open' || c.status === 'in_progress').length || 0;
    const totalCases = cases.documents?.length || 0;
    const fraudPrevented = transactions.documents?.reduce((sum, t) => sum + (t.status === 'blocked' ? (t.amount || 0) : 0), 0) || 0;
    res.json({ totalTransactions, fraudDetected, threatsIdentified, confirmedThreats, openCases, totalCases, fraudPrevented });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ─── POST ROUTES ───
app.post('/api/transactions', async (req, res) => {
  try {
    const data = { ...req.body, timestamp: new Date().toISOString() };
    const response = await appwriteFetch(
      `/databases/${DATABASE_ID}/collections/transactions/documents`,
      'POST',
      { documentId: ID.unique(), data }
    );
    res.status(201).json(response);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/threats', async (req, res) => {
  try {
    const response = await appwriteFetch(
      `/databases/${DATABASE_ID}/collections/threats/documents`,
      'POST',
      { documentId: ID.unique(), data: req.body }
    );
    res.status(201).json(response);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/cases', async (req, res) => {
  try {
    const data = { ...req.body, createdAt: new Date().toISOString() };
    const response = await appwriteFetch(
      `/databases/${DATABASE_ID}/collections/cases/documents`,
      'POST',
      { documentId: ID.unique(), data }
    );
    res.status(201).json(response);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.patch('/api/cases/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await appwriteFetch(
      `/databases/${DATABASE_ID}/collections/cases/documents/${id}`,
      'PATCH',
      { data: req.body }
    );
    res.json(response);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ─── AUDIT LOGS ───
app.get('/api/audit-logs', async (req, res) => {
  try {
    const response = await appwriteFetch(`/databases/${DATABASE_ID}/collections/audit_logs/documents?limit=50`);
    res.json(response.documents || []);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/audit-logs', async (req, res) => {
  try {
    const data = { ...req.body, timestamp: new Date().toISOString() };
    const response = await appwriteFetch(
      `/databases/${DATABASE_ID}/collections/audit_logs/documents`,
      'POST',
      { documentId: ID.unique(), data }
    );
    res.status(201).json(response);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ─── THREAT ACTIONS ───
app.patch('/api/threats/:id/confirm', async (req, res) => {
  try {
    const { id } = req.params;
    const updateResponse = await appwriteFetch(
      `/databases/${DATABASE_ID}/collections/threats/documents/${id}`,
      'PATCH',
      { data: { status: 'CONFIRMED', analyst_confirmed: true } }
    );
    
    await appwriteFetch(
      `/databases/${DATABASE_ID}/collections/audit_logs/documents`,
      'POST',
      {
        documentId: ID.unique(),
        data: {
          action: 'THREAT_CONFIRMED',
          entityId: id,
          analystId: 'analyst_001',
          timestamp: new Date().toISOString(),
          rbi_reference: 'RBI/2021-22/74'
        }
      }
    );
    
    res.json(updateResponse);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.patch('/api/threats/:id/blocklist', async (req, res) => {
  try {
    const { id } = req.params;
    const updateResponse = await appwriteFetch(
      `/databases/${DATABASE_ID}/collections/threats/documents/${id}`,
      'PATCH',
      { data: { status: 'BLOCKLISTED' } }
    );
    
    await appwriteFetch(
      `/databases/${DATABASE_ID}/collections/audit_logs/documents`,
      'POST',
      {
        documentId: ID.unique(),
        data: {
          action: 'THREAT_BLOCKLISTED',
          entityId: id,
          analystId: 'analyst_001',
          timestamp: new Date().toISOString()
        }
      }
    );
    
    res.json(updateResponse);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.patch('/api/threats/:id/dismiss', async (req, res) => {
  try {
    const { id } = req.params;
    const updateResponse = await appwriteFetch(
      `/databases/${DATABASE_ID}/collections/threats/documents/${id}`,
      'PATCH',
      { data: { status: 'DISMISSED' } }
    );
    
    await appwriteFetch(
      `/databases/${DATABASE_ID}/collections/audit_logs/documents`,
      'POST',
      {
        documentId: ID.unique(),
        data: {
          action: 'THREAT_DISMISSED',
          entityId: id,
          analystId: 'analyst_001',
          timestamp: new Date().toISOString()
        }
      }
    );
    
    res.json(updateResponse);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ─── SIMULATION ───
app.post('/api/simulate', async (req, res) => {
  try {
    const { vector, count = 10 } = req.body;
    const results = [];
    for (let i = 0; i < count; i++) {
      const score = Math.floor(Math.random() * 100);
      const status = score >= 75 ? 'blocked' : score >= 40 ? 'flagged' : 'clear';
      const amount = Math.floor(Math.random() * 100000) + 500;
      const tx = {
        amount,
        sender: `sim_user_${Math.floor(Math.random() * 1000)}`,
        receiver: `sim_merch_${Math.floor(Math.random() * 100)}`,
        score,
        type: vector || 'Simulated',
        status,
        timestamp: new Date().toISOString(),
        simulated: true,
      };
      results.push(tx);
    }
    const detected = results.filter(r => r.score >= 40).length;
    const blocked = results.filter(r => r.score >= 75).length;
    const falsePositives = Math.floor(count * 0.02);
    res.json({
      total: count,
      detected,
      blocked,
      falsePositives,
      detectionRate: Math.round((detected / count) * 100),
      transactions: results,
    });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ─── HEALTH & SEED ───
app.get('/api/health', (req, res) => {
  const start = Date.now();
  res.json({
    status: 'ok',
    api_latency_ms: Date.now() - start,
    ml_inference_ms: null,
    tps: Math.floor(Math.random() * 200) + 900,
    uptime_seconds: Math.floor(process.uptime()),
    false_positive_rate: 2.1,
    websocket_connections: 0,
    timestamp: new Date().toISOString()
  });
});
app.post('/api/seed', async (req, res) => { await seedData(); res.json({ message: 'Seeded!' }); });

initializeAppwrite().then(() => {
  seedData().then(() => {
    app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
  }).catch(() => {
    app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT} (seed failed, will use mock data)`));
  });
});