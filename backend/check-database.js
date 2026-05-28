require('dotenv').config();
const MongoDB = require('./mongodb');

async function checkDatabase() {
  const db = new MongoDB();
  
  try {
    console.log('🔍 Checking database collections...');
    
    await db.connect();
    console.log('✅ Connected to database');
    
    const database = db.db;
    
    // Check PatientRegistration collection
    console.log('\n1. Checking PatientRegistration collection...');
    const patients = await database.collection('PatientRegistration').find({}).toArray();
    console.log(`Found ${patients.length} patients in total`);
    
    if (patients.length > 0) {
      console.log('\nPatient data:');
      patients.forEach((patient, index) => {
        console.log(`\nPatient ${index + 1}:`);
        console.log(`  ID: ${patient._id}`);
        console.log(`  Name: ${patient.firstName || 'N/A'} ${patient.lastName || 'N/A'}`);
        console.log(`  Email: ${patient.email || 'N/A'}`);
        console.log(`  isApproved: ${patient.isApproved}`);
        console.log(`  createdAt: ${patient.createdAt || 'N/A'}`);
        console.log(`  All fields:`, Object.keys(patient));
      });
      
      // Check specifically for pending patients
      console.log('\n2. Checking pending patients (isApproved: false)...');
      const pendingPatients = await database.collection('PatientRegistration')
        .find({ isApproved: false })
        .toArray();
      console.log(`Found ${pendingPatients.length} patients with isApproved: false`);
      
      // Check for patients without isApproved field
      console.log('\n3. Checking patients without isApproved field...');
      const patientsWithoutApproval = await database.collection('PatientRegistration')
        .find({ isApproved: { $exists: false } })
        .toArray();
      console.log(`Found ${patientsWithoutApproval.length} patients without isApproved field`);
      
      // Check the current query used in the API
      console.log('\n4. Testing current API query...');
      const currentQuery = await database.collection('PatientRegistration')
        .find({ 
          $or: [
            { isApproved: false },
            { isApproved: { $exists: false } }
          ]
        })
        .toArray();
      console.log(`Current API query returns ${currentQuery.length} patients`);
      
    } else {
      console.log('No patients found in the collection');
    }
    
    // Also check DoctorRegistration for comparison
    console.log('\n5. Checking DoctorRegistration collection for comparison...');
    const doctors = await database.collection('DoctorRegistration').find({}).toArray();
    console.log(`Found ${doctors.length} doctors in total`);
    
    if (doctors.length > 0) {
      const doctor = doctors[0];
      console.log('Sample doctor approval status:', doctor.isApproved);
    }
    
  } catch (error) {
    console.error('❌ Database check error:', error);
  } finally {
    await db.close();
  }
}

checkDatabase();