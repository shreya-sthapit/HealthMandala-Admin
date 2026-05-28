require('dotenv').config();
const { default: fetch } = require('node-fetch');

async function testPatientImages() {
  try {
    console.log('🖼️  Testing Patient Image Proxy...');
    
    // Test login first to get token
    console.log('\n1. Getting admin token...');
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
    
    console.log('✅ Login successful');
    
    // Get pending patients to find image paths
    console.log('\n2. Getting patient data...');
    const patientsResponse = await fetch('http://localhost:9000/api/admin/pending-patients', {
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const patientsData = await patientsResponse.json();
    
    if (patientsData.length === 0) {
      console.log('⚠️ No patients found to test images');
      return;
    }
    
    const patient = patientsData[0];
    console.log(`✅ Found patient: ${patient.firstName} ${patient.lastName}`);
    
    // Test each image type
    const imageTypes = [
      { name: 'Profile Photo', path: patient.profilePhoto },
      { name: 'NID Front', path: patient.nidFrontImage },
      { name: 'NID Back', path: patient.nidBackImage }
    ];
    
    console.log('\n3. Testing patient image proxy endpoints...');
    
    for (const imageType of imageTypes) {
      if (imageType.path) {
        try {
          const imageUrl = `http://localhost:9000/proxy-image/${imageType.path}`;
          console.log(`\nTesting ${imageType.name}: ${imageUrl}`);
          
          const imageResponse = await fetch(imageUrl);
          
          if (imageResponse.ok) {
            const contentType = imageResponse.headers.get('content-type');
            const contentLength = imageResponse.headers.get('content-length');
            console.log(`✅ ${imageType.name}: ${imageResponse.status} ${imageResponse.statusText}`);
            console.log(`   Content-Type: ${contentType}`);
            console.log(`   Content-Length: ${contentLength} bytes`);
          } else {
            console.log(`❌ ${imageType.name}: ${imageResponse.status} ${imageResponse.statusText}`);
          }
        } catch (error) {
          console.log(`❌ ${imageType.name}: Error - ${error.message}`);
        }
      } else {
        console.log(`⚠️ ${imageType.name}: No image path found`);
      }
    }
    
    console.log('\n🎉 Patient image proxy test completed!');
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testPatientImages();