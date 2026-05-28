require('dotenv').config();
const { default: fetch } = require('node-fetch');

async function testPatients() {
  try {
    console.log('🧪 Testing Patient Endpoints...');
    
    // Test login first
    console.log('\n1. Testing login...');
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
    console.log('Login response:', loginData);
    
    if (loginData.token) {
      const token = loginData.token;
      console.log('✅ Login successful');
      
      // Test pending patients endpoint
      console.log('\n2. Testing pending patients endpoint...');
      const patientsResponse = await fetch('http://localhost:9000/api/admin/pending-patients', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const patientsData = await patientsResponse.json();
      console.log('Patients response status:', patientsResponse.status);
      console.log('Patients data:', JSON.stringify(patientsData, null, 2));
      
      if (patientsData.length > 0) {
        console.log('✅ Found pending patients:', patientsData.length);
      } else {
        console.log('⚠️ No pending patients found');
      }
      
      // Let's also check what's in the PatientRegistration collection directly
      console.log('\n3. Let me check the database directly...');
      
    } else {
      console.log('❌ Login failed');
    }
    
  } catch (error) {
    console.error('❌ API test error:', error);
  }
}

testPatients();