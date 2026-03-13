const API_BASE = 'http://localhost:3002/api';

export const api = {
  // Health check
  async health() {
    try {
      const res = await fetch(`${API_BASE}/health`);
      return await res.json();
    } catch (e) {
      return { status: 'error', error: e.message };
    }
  },

  // Stats
  async getStats() {
    try {
      const res = await fetch(`${API_BASE}/stats`);
      return await res.json();
    } catch (e) {
      console.error('Stats API error:', e);
      return null;
    }
  },

  // Transactions
  async getTransactions() {
    try {
      const res = await fetch(`${API_BASE}/transactions`);
      return await res.json();
    } catch (e) {
      console.error('Transactions API error:', e);
      return [];
    }
  },

  async createTransaction(data) {
    try {
      const res = await fetch(`${API_BASE}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (e) {
      console.error('Create transaction error:', e);
      return null;
    }
  },

  // Threats
  async getThreats() {
    try {
      const res = await fetch(`${API_BASE}/threats`);
      return await res.json();
    } catch (e) {
      console.error('Threats API error:', e);
      return [];
    }
  },

  async createThreat(data) {
    try {
      const res = await fetch(`${API_BASE}/threats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (e) {
      console.error('Create threat error:', e);
      return null;
    }
  },

  // Cases
  async getCases() {
    try {
      const res = await fetch(`${API_BASE}/cases`);
      return await res.json();
    } catch (e) {
      console.error('Cases API error:', e);
      return [];
    }
  },

  async createCase(data) {
    try {
      const res = await fetch(`${API_BASE}/cases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (e) {
      console.error('Create case error:', e);
      return null;
    }
  },

  async updateCase(id, data) {
    try {
      const res = await fetch(`${API_BASE}/cases/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (e) {
      console.error('Update case error:', e);
      return null;
    }
  },

  // Compliance
  async getCompliance() {
    try {
      const res = await fetch(`${API_BASE}/compliance`);
      return await res.json();
    } catch (e) {
      console.error('Compliance API error:', e);
      return [];
    }
  }
};

export default api;