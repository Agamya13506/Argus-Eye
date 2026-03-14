import { Client, Databases, ID, Permission, Role } from 'node-appwrite';

class AppwriteService {
  constructor() {
    this.client = new Client()
      .setEndpoint('https://nyc.cloud.appwrite.io/v1')
      .setProject('69b423e1001873687a8d')
      .setKey('standard_02e9cc014ffd457e7ca594569b8d70d519d68ac96f9b512fe3f9b8e01ac7b09016722aa44e9a9f3d11f612f9402c19ae6ab2d756013eafd88a703ead0a4b7308a481a3a5c370c78416fab07933fb54a88250b5a1b9789dbec0ca5ea35e8910df4cd9d763184d69aff433211e3b021ad958a023532f32f9c0d3a1e56a0ea57b7c');
    this.databases = new Databases(this.client);
    this.databaseId = 'argus_eye_db';
  }

  async initialize() {
    console.log('Checking Appwrite connection using SDK...');
    try {
      const db = await this.databases.get(this.databaseId);
      console.log('Database found:', db.name);
      return true;
    } catch (e) {
      console.log('Creating database...');
      try {
        await this.databases.create(this.databaseId, 'Argus Eye Database');
        console.log('Database created');
        return true;
      } catch (err) {
        console.error('Failed to create database:', err.message);
        return false;
      }
    }
  }

  async createCollection(collectionId, name) {
    try {
      await this.databases.getCollection(this.databaseId, collectionId);
      console.log(`Collection ${name} exists`);
      return true;
    } catch (e) {
      console.log(`Creating collection ${name}...`);
      try {
        await this.databases.createCollection(
          this.databaseId,
          collectionId,
          name,
          [
            Permission.read(Role.any()),
            Permission.write(Role.any())
          ]
        );
        console.log(`Collection ${name} created`);
        return true;
      } catch (err) {
        console.error(`Failed to create collection ${name}:`, err.message);
        return false;
      }
    }
  }

  async createDocument(collectionId, documentId, data, permissions = []) {
    try {
      // If no permissions provided, use default: read/write for anyone
      const docPermissions = permissions.length > 0 ? permissions : [
        Permission.read(Role.any()),
        Permission.write(Role.any())
      ];

      return await this.databases.createDocument(
        this.databaseId,
        collectionId,
        documentId,
        data,
        docPermissions
      );
    } catch (err) {
      console.error(`Failed to create document in ${collectionId}:`, err.message);
      throw err;
    }
  }

  async getDocuments(collectionId, queries = []) {
    try {
      const result = await this.databases.listDocuments(
        this.databaseId,
        collectionId,
        queries
      );
      return result.documents;
    } catch (err) {
      console.error(`Failed to get documents from ${collectionId}:`, err.message);
      return [];
    }
  }

  async getDocumentsWithTotal(collectionId, queries = []) {
    try {
      const result = await this.databases.listDocuments(
        this.databaseId,
        collectionId,
        queries
      );
      return result;
    } catch (err) {
      console.error(`Failed to get documents (with total) from ${collectionId}:`, err.message);
      return { total: 0, documents: [] };
    }
  }

  async updateDocument(collectionId, documentId, data) {
    try {
      return await this.databases.updateDocument(
        this.databaseId,
        collectionId,
        documentId,
        data
      );
    } catch (err) {
      console.error(`Failed to update document ${documentId}:`, err.message);
      throw err;
    }
  }

  async deleteDocument(collectionId, documentId) {
    try {
      await this.databases.deleteDocument(this.databaseId, collectionId, documentId);
      return true;
    } catch (err) {
      console.error(`Failed to delete document ${documentId}:`, err.message);
      return false;
    }
  }
}

export const appwrite = new AppwriteService();
export { ID, Permission, Role, Query } from 'node-appwrite';
