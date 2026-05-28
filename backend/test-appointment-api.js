// Test appointment API endpoints
const fetch = require('node-fetch');

async function testAppointmentAPI() {
  try {
    console.log('='.repeat(70));
    console.log('🧪 TESTING APPOINTMENT API ENDPOINTS');
    console.log('='.repeat(70));
    console.log('\n');
    
    // First, login to get token
    console.log('1️⃣  Logging in to get admin token...\n');
    
    const loginResponse = await fetch('http://localhost:9000/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@gmail.com',
        password: 'admin123'
      })
    });
    
    if (!loginResponse.ok) {
      console.error('❌ Login failed:', loginResponse.status);
      process.exit(1);
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login successful, token obtained\n');
    
    // Test pending appointments endpoint
    console.log('2️⃣  Testing /api/admin/pending-appointments...\n');
    
    const pendingResponse = await fetch('http://localhost:9000/api/admin/pending-appointments', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const pendingData = await pendingResponse.json();
    console.log(`✅ Pending Appointments: ${pendingData.length} found`);
    
    if (pendingData.length > 0) {
      console.log('\nPending Appointment Details:');
      pendingData.forEach((apt, index) => {
        console.log(`\n  Appointment ${index + 1}:`);
        console.log(`    Patient: ${apt.patientName}`);
        console.log(`    Doctor: ${apt.doctorName}`);
        console.log(`    Date: ${apt.appointmentDate}`);
        console.log(`    Time: ${apt.appointmentTime}`);
        console.log(`    Status: ${apt.status}`);
        console.log(`    Reason: ${apt.reasonForVisit}`);
      });
    }
    console.log('\n');
    
    // Test approved appointments endpoint
    console.log('3️⃣  Testing /api/admin/approved-appointments...\n');
    
    const approvedResponse = await fetch('http://localhost:9000/api/admin/approved-appointments', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const approvedData = await approvedResponse.json();
    console.log(`✅ Approved Appointments: ${approvedData.length} found\n`);
    
    // Test stats endpoint
    console.log('4️⃣  Testing /api/admin/stats...\n');
    
    const statsResponse = await fetch('http://localhost:9000/api/admin/stats', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const statsData = await statsResponse.json();
    console.log('✅ Dashboard Statistics:');
    console.log(`    Patients: ${statsData.patientCount}`);
    console.log(`    Doctors: ${statsData.doctorCount}`);
    console.log(`    Pending Appointments: ${statsData.pendingAppointments}`);
    console.log(`    Approved Appointments: ${statsData.approvedAppointments}`);
    console.log(`    Pending Doctor Approvals: ${statsData.pendingDoctorApprovals}`);
    console.log(`    Pending Patient Approvals: ${statsData.pendingPatientApprovals}`);
    console.log('\n');
    
    console.log('='.repeat(70));
    console.log('✅ ALL TESTS COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(70));
    console.log('\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testAppointmentAPI();
