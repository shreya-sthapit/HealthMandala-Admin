require('dotenv').config();
const MongoDB = require('./mongodb');

async function diagnoseApprovedProfiles() {
  const db = new MongoDB();
  
  try {
    console.log('🔍 Diagnosing Approved Profiles Issue...');
    
    await db.connect();
    console.log('✅ Connected to database');
    
    const database = db.db;
    
    // Check all doctors in the database
    console.log('\n1. Checking all doctors in DoctorRegistration collection...');
    const allDoctors = await database.collection('DoctorRegistration').find({}).toArray();
    console.log(`Found ${allDoctors.length} total doctors`);
    
    allDoctors.forEach((doctor, index) => {
      console.log(`\nDoctor ${index + 1}:`);
      console.log(`  ID: ${doctor._id}`);
      console.log(`  Name: ${doctor.firstName} ${doctor.lastName}`);
      console.log(`  Email: ${doctor.email}`);
      console.log(`  isApproved: ${doctor.isApproved} (type: ${typeof doctor.isApproved})`);
      console.log(`  status: ${doctor.status} (type: ${typeof doctor.status})`);
      console.log(`  createdAt: ${doctor.createdAt}`);
      console.log(`  updatedAt: ${doctor.updatedAt}`);
    });
    
    // Check what the approved doctors query returns
    console.log('\n2. Testing approved doctors query (isApproved: true)...');
    const approvedDoctorsQuery1 = await database.collection('DoctorRegistration')
      .find({ isApproved: true })
      .toArray();
    console.log(`Query { isApproved: true } returns: ${approvedDoctorsQuery1.length} doctors`);
    
    // Check what the approved doctors query returns with status
    console.log('\n3. Testing approved doctors query (status: "approved")...');
    const approvedDoctorsQuery2 = await database.collection('DoctorRegistration')
      .find({ status: "approved" })
      .toArray();
    console.log(`Query { status: "approved" } returns: ${approvedDoctorsQuery2.length} doctors`);
    
    // Check combined query
    console.log('\n4. Testing combined query...');
    const approvedDoctorsQuery3 = await database.collection('DoctorRegistration')
      .find({ 
        $or: [
          { isApproved: true },
          { status: "approved" }
        ]
      })
      .toArray();
    console.log(`Combined query returns: ${approvedDoctorsQuery3.length} doctors`);
    
    // Check all patients
    console.log('\n5. Checking all patients in PatientRegistration collection...');
    const allPatients = await database.collection('PatientRegistration').find({}).toArray();
    console.log(`Found ${allPatients.length} total patients`);
    
    allPatients.forEach((patient, index) => {
      console.log(`\nPatient ${index + 1}:`);
      console.log(`  ID: ${patient._id}`);
      console.log(`  Name: ${patient.firstName} ${patient.lastName}`);
      console.log(`  Email: ${patient.email}`);
      console.log(`  isApproved: ${patient.isApproved} (type: ${typeof patient.isApproved})`);
      console.log(`  status: ${patient.status} (type: ${typeof patient.status})`);
      console.log(`  createdAt: ${patient.createdAt}`);
      console.log(`  updatedAt: ${patient.updatedAt}`);
    });
    
    // Test patient queries
    console.log('\n6. Testing approved patients queries...');
    const approvedPatientsQuery1 = await database.collection('PatientRegistration')
      .find({ isApproved: true })
      .toArray();
    console.log(`Query { isApproved: true } returns: ${approvedPatientsQuery1.length} patients`);
    
    const approvedPatientsQuery2 = await database.collection('PatientRegistration')
      .find({ status: "approved" })
      .toArray();
    console.log(`Query { status: "approved" } returns: ${approvedPatientsQuery2.length} patients`);
    
    console.log('\n🎯 DIAGNOSIS COMPLETE');
    console.log('Check the output above to see what queries are returning results.');
    
  } catch (error) {
    console.error('❌ Diagnosis error:', error);
  } finally {
    await db.close();
  }
}

diagnoseApprovedProfiles();