// Check appointments in database
const MongoDB = require('./mongodb');

async function checkAppointments() {
  try {
    const db = new MongoDB();
    await db.connect();
    
    console.log('='.repeat(70));
    console.log('📅 APPOINTMENT DATA CHECK');
    console.log('='.repeat(70));
    console.log('\n');
    
    // Check all collections
    const collections = await db.db.listCollections().toArray();
    console.log('Available Collections:');
    collections.forEach(col => console.log(`  - ${col.name}`));
    console.log('\n');
    
    // Check Appointments collection
    console.log('🔍 Checking Appointments Collection:');
    const appointments = await db.db.collection('Appointments').find({}).toArray();
    console.log(`Total appointments: ${appointments.length}\n`);
    
    if (appointments.length > 0) {
      appointments.forEach((apt, index) => {
        console.log(`Appointment ${index + 1}:`);
        console.log(JSON.stringify(apt, null, 2));
        console.log('\n');
      });
    } else {
      console.log('❌ No appointments found in Appointments collection\n');
    }
    
    // Check if there's an appointments collection with different name
    console.log('🔍 Checking for alternative appointment collections:');
    const allCollections = collections.map(c => c.name);
    const appointmentCollections = allCollections.filter(name => 
      name.toLowerCase().includes('appoint') || 
      name.toLowerCase().includes('booking')
    );
    
    if (appointmentCollections.length > 0) {
      console.log(`Found ${appointmentCollections.length} appointment-related collection(s):`);
      appointmentCollections.forEach(collName => {
        console.log(`  - ${collName}`);
      });
    } else {
      console.log('No alternative appointment collections found');
    }
    console.log('\n');
    
    // Check DoctorRegistration for any appointment references
    console.log('🔍 Checking DoctorRegistration collection:');
    const doctors = await db.db.collection('DoctorRegistration').find({}).toArray();
    console.log(`Total doctors: ${doctors.length}`);
    if (doctors.length > 0) {
      console.log('Doctor data sample:');
      console.log(JSON.stringify(doctors[0], null, 2));
    }
    console.log('\n');
    
    // Check PatientRegistration for any appointment references
    console.log('🔍 Checking PatientRegistration collection:');
    const patients = await db.db.collection('PatientRegistration').find({}).toArray();
    console.log(`Total patients: ${patients.length}`);
    if (patients.length > 0) {
      console.log('Patient data sample:');
      console.log(JSON.stringify(patients[0], null, 2));
    }
    console.log('\n');
    
    console.log('='.repeat(70));
    
    await db.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAppointments();
