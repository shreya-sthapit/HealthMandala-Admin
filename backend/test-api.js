require('dotenv').config();
const { default: fetch } = require('node-fetch');

async function testAPI() {
  try {
    console.log('🧪 Testing API endpoints...');
    
    // Test login first
    console.log('\n1. Testing login...');
    const loginResponse = await fetch('http://localhost:9001/api/admin/login', {
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
      
      // Test pending doctors endpoint
      console.log('\n2. Testing pending doctors endpoint...');
      const doctorsResponse = await fetch('http://localhost:9001/api/admin/pending-doctors', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const doctorsData = await doctorsResponse.json();
      console.log('Doctors response status:', doctorsResponse.status);
      console.log('Doctors data:', JSON.stringify(doctorsData, null, 2));
      
      if (doctorsData.length > 0) {
        console.log('✅ Found pending doctors:', doctorsData.length);
      } else {
        console.log('⚠️ No pending doctors found');
      }
      
      // Test stats endpoint
      console.log('\n3. Testing stats endpoint...');
      const statsResponse = await fetch('http://localhost:9001/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const statsData = await statsResponse.json();
      console.log('Stats data:', JSON.stringify(statsData, null, 2));
      
    } else {
      console.log('❌ Login failed');
    }
    
  } catch (error) {
    console.error('❌ API test error:', error);
  }
}

testAPI();