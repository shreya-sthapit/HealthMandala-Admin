// Check all data in database
const MongoDB = require('./mongodb');

async function checkAllData() {
  try {
    const db = new MongoDB();
    await db.connect();
    
    console.log('='.repeat(60));
    console.log('📊 Database Content Check');
    console.log('='.repeat(60));
    console.log('\n');
    
    // Check all collections
    const collections = await db.db.listCollections().toArray();
    console.log('Available Collections:');
    collections.forEach(col => console.log(`  - ${col.name}`));
    console.log('\n');
    
    // Check DoctorRegistration
    console.log('🩺 DoctorRegistration Collection:');
    const doctors = await db.db.collection('DoctorRegistration').find({}).toArray();
    console.log(`  Total: ${doctors.length} doctor(s)`);
    
    if (doctors.length > 0) {
      doctors.forEach((doctor, index) => {
        console.log(`\n  Doctor ${index + 1}:`);
        console.log(`    Name: ${doctor.firstName} ${doctor.lastName}`);
        console.log(`    Email: ${doctor.email}`);
        console.log(`    Specialization: ${doctor.specialization}`);
        console.log(`    Approved: ${doctor.isApproved ? 'Yes' : 'No'}`);
        console.log(`    Profile Photo: ${doctor.profilePhoto || 'Not uploaded'}`);
        console.log(`    NMC Certificate: ${doctor.nmcCertificateImage || 'Not uploaded'}`);
        console.log(`    Degree Certificate: ${doctor.degreeCertificateImage || 'Not uploaded'}`);
        console.log(`    NID Front: ${doctor.nidFrontImage || 'Not uploaded'}`);
        console.log(`    NID Back: ${doctor.nidBackImage || 'Not uploaded'}`);
      });
    }
    console.log('\n');
    
    // Check PatientRegistration
    console.log('🏥 PatientRegistration Collection:');
    const patients = await db.db.collection('PatientRegistration').find({}).toArray();
    console.log(`  Total: ${patients.length} patient(s)`);
    
    if (patients.length > 0) {
      patients.forEach((patient, index) => {
        console.log(`\n  Patient ${index + 1}:`);
        console.log(`    Name: ${patient.firstName} ${patient.lastName}`);
        console.log(`    Email: ${patient.email}`);
        console.log(`    Approved: ${patient.isApproved ? 'Yes' : 'No'}`);
        console.log(`    Profile Photo: ${patient.profilePhoto || 'Not uploaded'}`);
      });
    }
    console.log('\n');
    
    // Check Appointments
    console.log('📅 Appointments Collection:');
    const appointments = await db.db.collection('Appointments').find({}).toArray();
    console.log(`  Total: ${appointments.length} appointment(s)`);
    console.log('\n');
    
    // Check admininfo
    console.log('👤 admininfo Collection:');
    const admins = await db.db.collection('admininfo').find({}).toArray();
    console.log(`  Total: ${admins.length} admin(s)`);
    
    if (admins.length > 0) {
      admins.forEach((admin, index) => {
        console.log(`\n  Admin ${index + 1}:`);
        console.log(`    Email: ${admin.email}`);
        console.log(`    Name: ${admin.name || 'N/A'}`);
      });
    }
    console.log('\n');
    
    console.log('='.repeat(60));
    
    await db.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAllData();
