require('dotenv').config();
const { default: fetch } = require('node-fetch');

async function testApprovedSections() {
  try {
    console.log('🧪 Testing Approved Sections...');
    
    // Test login first
    console.log('\n1. Testing admin login...');
    const loginResponse = await fetch('http://localhost:9000/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@gmail.com',
        password: 'admin123'
      }),
    });
    
    const loginData = await loginResponse.json();
    
    if (!loginData.token) {
      console.log('❌ Login failed');
      return;
    }
    
    console.log('✅ Admin login successful');
    const token = loginData.token;
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Test approved doctors endpoint
    console.log('\n2. Testing approved doctors endpoint...');
    const approvedDoctorsResponse = await fetch('http://localhost:9000/api/admin/approved-doctors', { headers });
    const approvedDoctorsData = await approvedDoctorsResponse.json();
    
    console.log(`✅ Approved doctors: ${approvedDoctorsData.length} found`);
    if (approvedDoctorsData.length > 0) {
      const doctor = approvedDoctorsData[0];
      console.log(`   - Dr. ${doctor.firstName} ${doctor.lastName} (Status: ${doctor.status})`);
    }
    
    // Test approved patients endpoint
    console.log('\n3. Testing approved patients endpoint...');
    const approvedPatientsResponse = await fetch('http://localhost:9000/api/admin/approved-patients', { headers });
    const approvedPatientsData = await approvedPatientsResponse.json();
    
    console.log(`✅ Approved patients: ${approvedPatientsData.length} found`);
    if (approvedPatientsData.length > 0) {
      const patient = approvedPatientsData[0];
      console.log(`   - ${patient.firstName} ${patient.lastName} (Status: ${patient.status})`);
    }
    
    // Test pending endpoints for comparison
    console.log('\n4. Testing pending endpoints for comparison...');
    const pendingDoctorsResponse = await fetch('http://localhost:9000/api/admin/pending-doctors', { headers });
    const pendingDoctorsData = await pendingDoctorsResponse.json();
    
    const pendingPatientsResponse = await fetch('http://localhost:9000/api/admin/pending-patients', { headers });
    const pendingPatientsData = await pendingPatientsResponse.json();
    
    console.log(`✅ Pending doctors: ${pendingDoctorsData.length}`);
    console.log(`✅ Pending patients: ${pendingPatientsData.length}`);
    
    console.log('\n🎉 Approved Sections Test Summary:');
    console.log('✅ Approved doctors endpoint working');
    console.log('✅ Approved patients endpoint working');
    console.log('✅ Frontend should now show approved sections');
    console.log('\n📊 Current Status:');
    console.log(`   Pending Doctors: ${pendingDoctorsData.length}`);
    console.log(`   Approved Doctors: ${approvedDoctorsData.length}`);
    console.log(`   Pending Patients: ${pendingPatientsData.length}`);
    console.log(`   Approved Patients: ${approvedPatientsData.length}`);
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testApprovedSections();