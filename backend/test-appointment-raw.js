// Test appointment with raw MongoDB client
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function testAppointment() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('healthmandala');
    
    console.log('='.repeat(70));
    console.log('🔍 RAW APPOINTMENT TEST');
    console.log('='.repeat(70));
    console.log('\n');
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('Collections in database:');
    collections.forEach(col => console.log(`  - ${col.name}`));
    console.log('\n');
    
    // Get Appointments collection
    const appointmentsCollection = db.collection('Appointments');
    const count = await appointmentsCollection.countDocuments();
    console.log(`Appointments collection count: ${count}\n`);
    
    // Get all appointments
    const appointments = await appointmentsCollection.find({}).toArray();
    console.log(`Found ${appointments.length} appointment(s):\n`);
    
    appointments.forEach((apt, index) => {
      console.log(`Appointment ${index + 1}:`);
      console.log(JSON.stringify(apt, null, 2));
      console.log('\n');
    });
    
    // Try different queries
    console.log('Testing different queries:\n');
    
    // Query 1: All appointments
    const all = await appointmentsCollection.find({}).toArray();
    console.log(`Query 1 - All: ${all.length} results`);
    
    // Query 2: By status
    const pending = await appointmentsCollection.find({ status: { $in: ['pending', 'requested'] } }).toArray();
    console.log(`Query 2 - Pending/Requested: ${pending.length} results`);
    
    // Query 3: By status approved
    const approved = await appointmentsCollection.find({ status: 'approved' }).toArray();
    console.log(`Query 3 - Approved: ${approved.length} results`);
    
    // Query 4: Check for null/undefined status
    const nullStatus = await appointmentsCollection.find({ status: { $exists: false } }).toArray();
    console.log(`Query 4 - No status field: ${nullStatus.length} results`);
    
    // Query 5: All with any status
    const anyStatus = await appointmentsCollection.find({ 
      $or: [
        { status: { $in: ['pending', 'requested'] } },
        { status: { $exists: false } },
        { status: null }
      ]
    }).toArray();
    console.log(`Query 5 - Pending/Requested/No status: ${anyStatus.length} results`);
    
    console.log('\n' + '='.repeat(70));
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    process.exit(0);
  }
}

testAppointment();
