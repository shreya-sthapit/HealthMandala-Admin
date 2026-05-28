// Test CORS and Image Proxy
const fetch = require('node-fetch');

async function testCORS() {
  console.log('🔍 Testing CORS Configuration...\n');
  
  try {
    // Test from network IP
    const response = await fetch('http://localhost:9000/api/health', {
      headers: {
        'Origin': 'http://10.21.10.248:3001'
      }
    });
    
    console.log('✅ CORS Test Response Status:', response.status);
    console.log('✅ Access-Control-Allow-Origin:', response.headers.get('access-control-allow-origin'));
    
    const data = await response.json();
    console.log('✅ Response Data:', data);
    console.log('\n');
  } catch (error) {
    console.error('❌ CORS Test Failed:', error.message);
  }
}

async function testImageProxy() {
  console.log('🔍 Testing Image Proxy...\n');
  
  try {
    // First, check if main backend is accessible
    const mainBackendTest = await fetch('http://localhost:5001/');
    console.log('✅ Main Backend (port 5001) Status:', mainBackendTest.status);
    
    // Test proxy endpoint
    const proxyTest = await fetch('http://localhost:9000/proxy-image/uploads/profiles/test.jpg');
    console.log('✅ Image Proxy Status:', proxyTest.status);
    
    if (proxyTest.status === 404) {
      console.log('ℹ️  Image not found (expected if no test image exists)');
    } else if (proxyTest.ok) {
      console.log('✅ Image proxy is working!');
    }
    
    console.log('\n');
  } catch (error) {
    console.error('❌ Image Proxy Test Failed:', error.message);
  }
}

async function checkDoctorImages() {
  console.log('🔍 Checking Doctor Images in Database...\n');
  
  try {
    const MongoDB = require('./mongodb');
    const db = new MongoDB();
    await db.connect();
    
    const doctors = await db.db.collection('DoctorRegistration').find({}).toArray();
    
    console.log(`Found ${doctors.length} doctor(s) in database\n`);
    
    doctors.forEach((doctor, index) => {
      console.log(`Doctor ${index + 1}: ${doctor.firstName} ${doctor.lastName}`);
      console.log('  Profile Photo:', doctor.profilePhoto || 'Not uploaded');
      console.log('  NMC Certificate:', doctor.nmcCertificateImage || 'Not uploaded');
      console.log('  Degree Certificate:', doctor.degreeCertificateImage || 'Not uploaded');
      console.log('  NID Front:', doctor.nidFrontImage || 'Not uploaded');
      console.log('  NID Back:', doctor.nidBackImage || 'Not uploaded');
      console.log('  Approval Status:', doctor.isApproved ? 'Approved' : 'Pending');
      console.log('\n');
    });
    
    await db.close();
  } catch (error) {
    console.error('❌ Database Check Failed:', error.message);
  }
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('🚀 Admin Backend Testing Suite');
  console.log('='.repeat(60));
  console.log('\n');
  
  await testCORS();
  await testImageProxy();
  await checkDoctorImages();
  
  console.log('='.repeat(60));
  console.log('✅ Testing Complete!');
  console.log('='.repeat(60));
  
  process.exit(0);
}

runTests();
