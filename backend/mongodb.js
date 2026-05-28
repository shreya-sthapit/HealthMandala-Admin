const { MongoClient } = require('mongodb');

class MongoDB {
  constructor() {
    // Use environment variables for connection
    this.connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/healthmandala';
    this.client = null;
    this.db = null;
  }

  async connect() {
    try {
      this.client = new MongoClient(this.connectionString);
      await this.client.connect();
      this.db = this.client.db('healthmandala'); // Explicitly specify database name
      console.log('✅ Connected to MongoDB Atlas - healthmandala database');
      return this.db;
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      throw error;
    }
  }

  async getAdminByEmail(email) {
    try {
      const collection = this.db.collection('admininfo');
      const admin = await collection.findOne({ email: email });
      return admin;
    } catch (error) {
      console.error('Error finding admin by email:', error);
      throw error;
    }
  }

  async getAdminById(id) {
    try {
      const { ObjectId } = require('mongodb');
      const collection = this.db.collection('admininfo');
      const admin = await collection.findOne({ _id: new ObjectId(id) });
      return admin;
    } catch (error) {
      console.error('Error finding admin by ID:', error);
      throw error;
    }
  }

  async createAdmin(adminData) {
    try {
      const collection = this.db.collection('admininfo');
      const result = await collection.insertOne(adminData);
      return result;
    } catch (error) {
      console.error('Error creating admin:', error);
      throw error;
    }
  }

  async close() {
    if (this.client) {
      await this.client.close();
      console.log('MongoDB connection closed');
    }
  }
}

module.exports = MongoDB;