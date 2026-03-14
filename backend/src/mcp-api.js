import express from 'express';
import { mcpServer, ID, Permission, Role, Query } from '../../mcp/appwrite-mcp-server.js';

console.log('MCP API: Starting module load...');
const router = express.Router();
console.log('MCP API: Router created');

// Middleware to validate MCP operations
const validateOperation = (req, res, next) => {
  const { operation, collectionId, documentId, data } = req.body;
  
  if (!operation) {
    return res.status(400).json({ error: 'Operation is required' });
  }
  
  // Only allow operations for known collections
  const allowedCollections = ['transactions', 'threats', 'cases', 'audit_logs', 'compliance'];
  if (collectionId && !allowedCollections.includes(collectionId)) {
    return res.status(400).json({ error: `Invalid collection: ${collectionId}` });
  }
  
  next();
};

// MCP Operations API
router.post('/operations', validateOperation, async (req, res) => {
  try {
    const { operation, collectionId, documentId, data, queries = [] } = req.body;
    
    let result;
    switch (operation) {
      case 'getDatabaseInfo':
        result = await mcpServer.getDatabaseInfo();
        break;
        
      case 'listCollections':
        result = await mcpServer.listCollections();
        break;
        
      case 'getDocument':
        if (!collectionId || !documentId) {
          return res.status(400).json({ error: 'collectionId and documentId are required' });
        }
        result = await mcpServer.getDocument(collectionId, documentId);
        break;
        
      case 'listDocuments':
        if (!collectionId) {
          return res.status(400).json({ error: 'collectionId is required' });
        }
        const queryObjects = queries.map(q => mcpServer.createQuery(q.type, ...q.args));
        result = await mcpServer.listDocuments(collectionId, queryObjects);
        break;
        
      case 'createDocument':
        if (!collectionId || !data) {
          return res.status(400).json({ error: 'collectionId and data are required' });
        }
        const docId = documentId || ID.unique();
        result = await mcpServer.createDocument(collectionId, docId, data);
        break;
        
      case 'updateDocument':
        if (!collectionId || !documentId || !data) {
          return res.status(400).json({ error: 'collectionId, documentId, and data are required' });
        }
        result = await mcpServer.updateDocument(collectionId, documentId, data);
        break;
        
      case 'deleteDocument':
        if (!collectionId || !documentId) {
          return res.status(400).json({ error: 'collectionId and documentId are required' });
        }
        result = await mcpServer.deleteDocument(collectionId, documentId);
        break;
        
      default:
        res.set('Content-Type', 'application/json');
        return res.status(400).send(JSON.stringify({ error: `Unknown operation: ${operation}` }));
    }
    
    res.set('Content-Type', 'application/json');
    res.send(serializeForJSON({ success: true, result }));
  } catch (error) {
    res.set('Content-Type', 'application/json');
    res.status(500).send(JSON.stringify({ error: error.message }));
  }
});

// Helper endpoints for common operations
router.get('/database', async (req, res) => {
  try {
    const result = await mcpServer.getDatabaseInfo();
    res.set('Content-Type', 'application/json');
    res.send(serializeForJSON(result));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/documents/:collectionId', async (req, res) => {
  try {
    const { collectionId } = req.params;
    const { limit, offset, orderBy, order } = req.query;
    
    const queries = [];
    if (limit) queries.push(mcpServer.createQuery('limit', parseInt(limit)));
    if (offset) queries.push(mcpServer.createQuery('offset', parseInt(offset)));
    if (orderBy) {
      queries.push(mcpServer.createQuery(order === 'desc' ? 'orderDesc' : 'orderAsc', orderBy));
    }
    
    const result = await mcpServer.listDocuments(collectionId, queries);
    res.set('Content-Type', 'application/json');
    res.send(serializeForJSON(result));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function serializeForJSON(obj) {
  const seen = new WeakSet();
  
  return JSON.stringify(obj, (key, value) => {
    // Convert BigInt to string FIRST (before checking type)
    if (typeof value === 'bigint') {
      return value.toString();
    }
    
    // Handle circular references only for objects
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular]';
      }
      seen.add(value);
    }
    
    return value;
  });
}

router.get('/collections', async (req, res) => {
  try {
    console.log('Before calling mcpServer.listCollections()');
    const result = await mcpServer.listCollections();
    console.log('After calling mcpServer.listCollections(), result type:', typeof result);
    
    // Handle case where result might be undefined or null
    if (!result) {
      console.log('Result is undefined or null, returning empty array');
      res.set('Content-Type', 'application/json');
      res.send(JSON.stringify([]));
      return;
    }
    
    console.log('Result is array:', Array.isArray(result));
    console.log('Result length:', result.length);
    
    const serialized = serializeForJSON(result);
    console.log('Serialized successfully, length:', serialized.length);
    
    res.set('Content-Type', 'application/json');
    res.send(serialized);
  } catch (error) {
    console.error('Error in /collections:', error.message);
    console.error('Stack:', error.stack);
    res.set('Content-Type', 'application/json');
    res.status(500).send(JSON.stringify({ error: error.message }));
  }
});

router.get('/documents/:collectionId', async (req, res) => {
  try {
    const { collectionId } = req.params;
    const { limit, offset, orderBy, order } = req.query;
    
    const queries = [];
    if (limit) queries.push(mcpServer.createQuery('limit', parseInt(limit)));
    if (offset) queries.push(mcpServer.createQuery('offset', parseInt(offset)));
    if (orderBy) {
      queries.push(mcpServer.createQuery(order === 'desc' ? 'orderDesc' : 'orderAsc', orderBy));
    }
    
    const result = await mcpServer.listDocuments(collectionId, queries);
    res.json(serializeForJSON(result));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/documents/:collectionId', async (req, res) => {
  try {
    const { collectionId } = req.params;
    const { documentId, data, permissions } = req.body;
    
    const docId = documentId || ID.unique();
    const perms = permissions ? permissions.map(p => Permission.read(Role.any())) : [];
    const result = await mcpServer.createDocument(collectionId, docId, data, perms);
    
    res.set('Content-Type', 'application/json');
    res.status(201).send(serializeForJSON(result));
  } catch (error) {
    res.set('Content-Type', 'application/json');
    res.status(500).send(JSON.stringify({ error: error.message }));
  }
});

router.patch('/documents/:collectionId/:documentId', async (req, res) => {
  try {
    const { collectionId, documentId } = req.params;
    const { data } = req.body;
    
    const result = await mcpServer.updateDocument(collectionId, documentId, data);
    res.set('Content-Type', 'application/json');
    res.send(serializeForJSON(result));
  } catch (error) {
    res.set('Content-Type', 'application/json');
    res.status(500).send(JSON.stringify({ error: error.message }));
  }
});

router.delete('/documents/:collectionId/:documentId', async (req, res) => {
  try {
    const { collectionId, documentId } = req.params;
    
    await mcpServer.deleteDocument(collectionId, documentId);
    res.set('Content-Type', 'application/json');
    res.send(JSON.stringify({ success: true, message: 'Document deleted' }));
  } catch (error) {
    res.set('Content-Type', 'application/json');
    res.status(500).send(JSON.stringify({ error: error.message }));
  }
});

export default router;
