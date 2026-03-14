import { mcpServer, ID, Permission, Role, Query } from './appwrite-mcp-server.js';

async function testAppwriteMCP() {
  console.log('Testing Appwrite MCP Server...\n');

  try {
    // Test database info
    console.log('1. Getting database info...');
    const dbInfo = await mcpServer.getDatabaseInfo();
    console.log(`✓ Database: ${dbInfo.name} (${dbInfo.$id})\n`);

    // Test list collections
    console.log('2. Listing collections...');
    const collections = await mcpServer.listCollections();
    console.log(`✓ Found ${collections.length} collections:`);
    collections.forEach(col => {
      console.log(`  - ${col.name} (${col.$id})`);
    });
    console.log();

    // Test create document with permissions
    console.log('3. Creating document with permissions...');
    const testDocId = ID.unique();
    const permissions = mcpServer.createPermissions(
      [Role.any()],
      [Role.any()]
    );
    const testDoc = await mcpServer.createDocument(
      'transactions',
      testDocId,
      {
        amount: 99999,
        sender: 'test_user',
        receiver: 'test_merch',
        score: 50,
        type: 'Test Transaction',
        status: 'pending',
        timestamp: new Date().toISOString()
      },
      permissions
    );
    console.log(`✓ Created document with ID: ${testDoc.$id}\n`);

    // Test get document
    console.log('4. Getting document...');
    const retrievedDoc = await mcpServer.getDocument('transactions', testDocId);
    console.log(`✓ Retrieved document: ${retrievedDoc.sender} -> ${retrievedDoc.receiver} (Score: ${retrievedDoc.score})\n`);

    // Test list documents with queries
    console.log('5. Listing documents with query...');
    const query = mcpServer.createQuery('greaterThan', 'score', 80);
    const highScoreDocs = await mcpServer.listDocuments('transactions', [query]);
    console.log(`✓ Found ${highScoreDocs.length} transactions with score > 80\n`);

    // Test update document
    console.log('6. Updating document...');
    const updatedDoc = await mcpServer.updateDocument(
      'transactions',
      testDocId,
      { score: 75, status: 'reviewed' }
    );
    console.log(`✓ Updated document score to: ${updatedDoc.score}\n`);

    // Test delete document
    console.log('7. Deleting document...');
    await mcpServer.deleteDocument('transactions', testDocId);
    console.log('✓ Document deleted successfully\n');

    console.log('✅ All tests passed! Appwrite MCP server is working correctly.');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run tests
testAppwriteMCP();
