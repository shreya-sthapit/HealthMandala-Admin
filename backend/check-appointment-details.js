// Check appointment details
const MongoDB = require('./mongodb');

async function checkAppointmentDetails() {
  try {
    const db = new MongoDB();
    await db.connect();
    
    console.log('='.repeat(70));
    console.log('📅 APPOINTMENT DETAILS');
    console.log('='.repeat(70));
    console.log('\n');
    
    // Get the appointment
    const appointment = await db.db.collection('Appointments').findOne({});
    
    if (appointment) {
      console.log('✅ Found appointment:');
      console.log(JSON.stringify(appointment, null, 2));
      console.log('\n');
      
      // Check the fields
      console.log('Field Analysis:');
      console.log(`  _id: ${appointment._id}`);
      console.log(`  patientId: ${appointment.patientId}`);
      console.log(`  doctorId: ${appointment.doctorId}`);
      console.log(`  status: ${appointment.status}`);
      console.log(`  appointmentDate: ${appointment.appointmentDate}`);
      console.log(`  appointmentTime: ${appointment.appointmentTime}`);
      console.log(`  reason: ${appointment.reason}`);
      console.log(`  createdAt: ${appointment.createdAt}`);
      console.log(`  updatedAt: ${appointment.updatedAt}`);
      console.log('\n');
      
      // Check if patient and doctor exist
      console.log('Related Data Check:');
      const patient = await db.db.collection('PatientRegistration').findOne({ 
        _id: appointment.patientId 
      });
      console.log(`  Patient found: ${patient ? '✅ Yes' : '❌ No'}`);
      if (patient) {
        console.log(`    Name: ${patient.firstName} ${patient.lastName}`);
      }
      
      const doctor = await db.db.collection('DoctorRegistration').findOne({ 
        _id: appointment.doctorId 
      });
      console.log(`  Doctor found: ${doctor ? '✅ Yes' : '❌ No'}`);
      if (doctor) {
        console.log(`    Name: ${doctor.firstName} ${doctor.lastName}`);
      }
      console.log('\n');
      
    } else {
      console.log('❌ No appointment found');
    }
    
    console.log('='.repeat(70));
    
    await db.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAppointmentDetails();
