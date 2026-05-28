// Check all databases and collections
const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function checkAllDatabases() {
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in .env file');
    process.exit(1);
  }
  
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('='.repeat(70));
    console.log('🗄️  MONGODB ATLAS - ALL DATABASES CHECK');
    console.log('='.repeat(70));
    console.log('\n');
    
    // List all databases
    const adminDb = client.db('admin');
    const databases = await adminDb.admin().listDatabases();
    
    console.log(`Found ${databases.databases.length} database(s):\n`);
    
    for (const dbInfo of databases.databases) {
      const dbName = dbInfo.name;
      console.log(`📦 Database: ${dbName}`);
      
      const db = client.db(dbName);
      const collections = await db.listCollections().toArray();
      
      console.log(`   Collections (${collections.length}):`);
      
      for (const col of collections) {
        const collection = db.collection(col.name);
        const count = await collection.countDocuments();
        console.log(`     - ${col.name}: ${count} document(s)`);
        
        // Show sample data for collections with data
        if (count > 0 && count <= 5) {
          const sample = await collection.findOne();
          console.log(`       Sample: ${JSON.stringify(sample).substring(0, 100)}...`);
        }
      }
      console.log('');
    }
    
    console.log('='.repeat(70));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    process.exit(0);
  }
}

checkAllDatabases();
