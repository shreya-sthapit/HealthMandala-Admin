require('dotenv').config();
const MongoDB = require('./mongodb');

async function testDatabase() {
  const db = new MongoDB();
  
  try {
    await db.connect();
    console.log('✅ Connected to MongoDB Atlas');
    
    const database = db.db;
    
    // Check DoctorRegistration collection
    console.log('\n📊 Checking DoctorRegistration collection...');
    const doctorCount = await database.collection('DoctorRegistration').countDocuments();
    console.log(`Total doctors: ${doctorCount}`);
    
    const pendingDoctors = await database.collection('DoctorRegistration').countDocuments({ 
      $or: [
        { isApproved: false },
        { isApproved: { $exists: false } }
      ]
    });
    console.log(`Pending doctors: ${pendingDoctors}`);
    
    const approvedDoctors = await database.collection('DoctorRegistration').countDocuments({ 
      isApproved: true 
    });
    console.log(`Approved doctors: ${approvedDoctors}`);
    
    // Show sample doctor data
    console.log('\n📋 Sample doctor records:');
    const sampleDoctors = await database.collection('DoctorRegistration')
      .find({})
      .limit(3)
      .toArray();
    
    sampleDoctors.forEach((doctor, index) => {
      console.log(`\nDoctor ${index + 1}:`);
      console.log(`  ID: ${doctor._id}`);
      console.log(`  Name: ${doctor.firstName || 'N/A'} ${doctor.lastName || 'N/A'}`);
      console.log(`  Email: ${doctor.email || 'N/A'}`);
      console.log(`  isApproved: ${doctor.isApproved}`);
      console.log(`  Created: ${doctor.createdAt || doctor.updatedAt || 'N/A'}`);
    });
    
    // Check other collections
    console.log('\n📊 Other collections:');
    const patientCount = await database.collection('PatientRegistration').countDocuments();
    console.log(`Total patients: ${patientCount}`);
    
    const appointmentCount = await database.collection('Appointments').countDocuments();
    console.log(`Total appointments: ${appointmentCount}`);
    
    const adminCount = await database.collection('admininfo').countDocuments();
    console.log(`Total admins: ${adminCount}`);
    
  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await db.close();
  }
}

testDatabase();