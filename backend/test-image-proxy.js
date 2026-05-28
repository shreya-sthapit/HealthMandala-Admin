require('dotenv').config();
const { default: fetch } = require('node-fetch');

async function testImageProxy() {
  try {
    console.log('🖼️  Testing Image Proxy...');
    
    // Test login first to get token
    console.log('\n1. Getting admin token...');
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
    
    if (!loginData.token) {
      console.log('❌ Login failed');
      return;
    }
    
    console.log('✅ Login successful');
    
    // Get pending doctors to find image paths
    console.log('\n2. Getting doctor data...');
    const doctorsResponse = await fetch('http://localhost:9001/api/admin/pending-doctors', {
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const doctorsData = await doctorsResponse.json();
    
    if (doctorsData.length === 0) {
      console.log('⚠️ No doctors found to test images');
      return;
    }
    
    const doctor = doctorsData[0];
    console.log(`✅ Found doctor: ${doctor.firstName} ${doctor.lastName}`);
    
    // Test each image type
    const imageTypes = [
      { name: 'Profile Photo', path: doctor.profilePhoto },
      { name: 'NMC Certificate', path: doctor.nmcCertificateImage },
      { name: 'Degree Certificate', path: doctor.degreeCertificateImage },
      { name: 'NID Front', path: doctor.nidFrontImage },
      { name: 'NID Back', path: doctor.nidBackImage }
    ];
    
    console.log('\n3. Testing image proxy endpoints...');
    
    for (const imageType of imageTypes) {
      if (imageType.path) {
        try {
          const imageUrl = `http://localhost:9001/proxy-image/${imageType.path}`;
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
    
    console.log('\n🎉 Image proxy test completed!');
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testImageProxy();