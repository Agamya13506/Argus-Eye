import { appwrite, ID, Permission, Role } from '../backend/src/appwrite-sdk.js';
import { Client, Databases, Query } from 'node-appwrite';

// MCP Server for Appwrite operations
class AppwriteMCPServer {
  constructor() {
    this.client = new Client()
      .setEndpoint('https://nyc.cloud.appwrite.io/v1')
      .setProject('69b423e1001873687a8d')
      .setKey('standard_02e9cc014ffd457e7ca594569b8d70d519d68ac96f9b512fe3f9b8e01ac7b09016722aa44e9a9f3d11f612f9402c19ae6ab2d756013eafd88a703ead0a4b7308a481a3a5c370c78416fab07933fb54a88250b5a1b9789dbec0ca5ea35e8910df4cd9d763184d69aff433211e3b021ad958a023532f32f9c0d3a1e56a0ea57b7c');
    this.databases = new Databases(this.client);
    this.databaseId = 'argus_eye_db';
  }

  // Database operations
  async getDatabaseInfo() {
    try {
      return await this.databases.get(this.databaseId);
    } catch (error) {
      throw new Error(`Failed to get database info: ${error.message}`);
    }
  }

  // Collection operations
  async listCollections() {
    try {
      const result = await this.databases.listCollections(this.databaseId);
      return result.collections;
    } catch (error) {
      throw new Error(`Failed to list collections: ${error.message}`);
    }
  }

  async createCollection(collectionId, name, permissions = []) {
    try {
      const result = await this.databases.createCollection(
        this.databaseId,
        collectionId,
        name,
        permissions
      );
      return result;
    } catch (error) {
      throw new Error(`Failed to create collection: ${error.message}`);
    }
  }

  async updateCollection(collectionId, name, permissions = []) {
    try {
      const result = await this.databases.updateCollection(
        this.databaseId,
        collectionId,
        name,
        permissions
      );
      return result;
    } catch (error) {
      throw new Error(`Failed to update collection: ${error.message}`);
    }
  }

  async deleteCollection(collectionId) {
    try {
      await this.databases.deleteCollection(this.databaseId, collectionId);
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to delete collection: ${error.message}`);
    }
  }

  // Attribute operations
  async createStringAttribute(collectionId, key, size, required = false) {
    try {
      const result = await this.databases.createStringAttribute(
        this.databaseId,
        collectionId,
        key,
        size,
        required
      );
      return result;
    } catch (error) {
      throw new Error(`Failed to create string attribute: ${error.message}`);
    }
  }

  async createIntegerAttribute(collectionId, key, required = false, min = null, max = null) {
    try {
      const result = await this.databases.createIntegerAttribute(
        this.databaseId,
        collectionId,
        key,
        required,
        min,
        max
      );
      return result;
    } catch (error) {
      throw new Error(`Failed to create integer attribute: ${error.message}`);
    }
  }

  async createFloatAttribute(collectionId, key, required = false, min = null, max = null) {
    try {
      const result = await this.databases.createFloatAttribute(
        this.databaseId,
        collectionId,
        key,
        required,
        min,
        max
      );
      return result;
    } catch (error) {
      throw new Error(`Failed to create float attribute: ${error.message}`);
    }
  }

  async createBooleanAttribute(collectionId, key, required = false) {
    try {
      const result = await this.databases.createBooleanAttribute(
        this.databaseId,
        collectionId,
        key,
        required
      );
      return result;
    } catch (error) {
      throw new Error(`Failed to create boolean attribute: ${error.message}`);
    }
  }

  async createDatetimeAttribute(collectionId, key, required = false) {
    try {
      const result = await this.databases.createDatetimeAttribute(
        this.databaseId,
        collectionId,
        key,
        required
      );
      return result;
    } catch (error) {
      throw new Error(`Failed to create datetime attribute: ${error.message}`);
    }
  }

  // Document operations
  async createDocument(collectionId, documentId, data, permissions = []) {
    try {
      const result = await this.databases.createDocument(
        this.databaseId,
        collectionId,
        documentId,
        data,
        permissions
      );
      return result;
    } catch (error) {
      throw new Error(`Failed to create document: ${error.message}`);
    }
  }

  async getDocument(collectionId, documentId) {
    try {
      const result = await this.databases.getDocument(
        this.databaseId,
        collectionId,
        documentId
      );
      return result;
    } catch (error) {
      throw new Error(`Failed to get document: ${error.message}`);
    }
  }

  async listDocuments(collectionId, queries = []) {
    try {
      const result = await this.databases.listDocuments(
        this.databaseId,
        collectionId,
        queries
      );
      return result.documents;
    } catch (error) {
      throw new Error(`Failed to list documents: ${error.message}`);
    }
  }

  async updateDocument(collectionId, documentId, data, permissions = []) {
    try {
      const result = await this.databases.updateDocument(
        this.databaseId,
        collectionId,
        documentId,
        data,
        permissions
      );
      return result;
    } catch (error) {
      throw new Error(`Failed to update document: ${error.message}`);
    }
  }

  async deleteDocument(collectionId, documentId) {
    try {
      await this.databases.deleteDocument(this.databaseId, collectionId, documentId);
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to delete document: ${error.message}`);
    }
  }

  // Permission helpers
  createPermissions(readRoles = [], writeRoles = []) {
    const perms = [];
    readRoles.forEach(role => perms.push(Permission.read(role)));
    writeRoles.forEach(role => perms.push(Permission.write(role)));
    return perms;
  }

  // Query helpers
  createQuery(type, ...args) {
    switch (type) {
      case 'equal':
        return Query.equal(...args);
      case 'notEqual':
        return Query.notEqual(...args);
      case 'lessThan':
        return Query.lessThan(...args);
      case 'lessThanEqual':
        return Query.lessThanEqual(...args);
      case 'greaterThan':
        return Query.greaterThan(...args);
      case 'greaterThanEqual':
        return Query.greaterThanEqual(...args);
      case 'contains':
        return Query.contains(...args);
      case 'search':
        return Query.search(...args);
      case 'orderAsc':
        return Query.orderAsc(...args);
      case 'orderDesc':
        return Query.orderDesc(...args);
      case 'limit':
        return Query.limit(...args);
      case 'offset':
        return Query.offset(...args);
      default:
        throw new Error(`Unknown query type: ${type}`);
    }
  }
}

// Export singleton instance
export const mcpServer = new AppwriteMCPServer();
export { ID, Permission, Role, Query } from 'node-appwrite';
