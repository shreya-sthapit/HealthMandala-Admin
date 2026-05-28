require('dotenv').config();
const { default: fetch } = require('node-fetch');

async function testUserConnection() {
  try {
    console.log('🔍 Testing User-Side Connection Issue...');
    
    // Test the exact email from the screenshot
    const email = 'sthapitshreya@gmail.com';
    
    console.log(`\n📧 Testing email: ${email}`);
    console.log(`🔗 Testing endpoint: http://localhost:9000/api/user/profile-status/${email}`);
    
    const response = await fetch(`http://localhost:9000/api/user/profile-status/${email}`);
    
    if (response.ok) {
      const data = await response.json();
      
      console.log('\n✅ SUCCESS - Profile Found!');
      console.log(`   Registered: ${data.registered}`);
      console.log(`   Type: ${data.type}`);
      console.log(`   Status: ${data.status}`);
      console.log(`   IsApproved: ${data.isApproved}`);
      console.log(`   Name: ${data.profile?.firstName} ${data.profile?.lastName}`);
      console.log(`   Profile ID: ${data.profile?.id}`);
      
      console.log('\n🎯 SOLUTION FOR YOUR USER-SIDE APPLICATION:');
      console.log('\n1. Make sure your user-side app calls this exact URL:');
      console.log(`   http://localhost:9000/api/user/profile-status/${email}`);
      
      console.log('\n2. Replace your current profile check with:');
      console.log(`
const checkUserProfile = async () => {
  try {
    const response = await fetch('http://localhost:9000/api/user/profile-status/${email}');
    const data = await response.json();
    
    console.log('Profile data:', data); // Debug log
    
    if (data.registered && data.status === 'approved') {
      // User is APPROVED - show full profile
      setUserRegistered(true);
      setUserApproved(true);
      setUserProfile(data.profile);
      setShowRegistrationPrompt(false);
      console.log('✅ User is approved!');
    } else if (data.registered && data.status === 'pending') {
      // User is registered but pending
      setUserRegistered(true);
      setUserApproved(false);
      setShowRegistrationPrompt(false);
      setMessage('Your profile is under review');
    } else {
      // User not registered
      setUserRegistered(false);
      setUserApproved(false);
      setShowRegistrationPrompt(true);
      setMessage('Please complete registration');
    }
  } catch (error) {
    console.error('Error checking profile:', error);
  }
};
      `);
      
      console.log('\n3. Make sure your user-side backend is NOT running on port 9000');
      console.log('   (or update the URL to point to the correct admin backend)');
      
      console.log('\n4. Add CORS headers if needed in your user-side backend');
      
    } else {
      console.log(`❌ FAILED - Status: ${response.status} ${response.statusText}`);
    }
    
    // Test CORS
    console.log('\n🌐 Testing CORS...');
    try {
      const corsResponse = await fetch('http://localhost:9000/api/health');
      if (corsResponse.ok) {
        console.log('✅ CORS: Admin backend is accessible');
      } else {
        console.log('❌ CORS: Admin backend not accessible');
      }
    } catch (error) {
      console.log('❌ CORS: Connection failed -', error.message);
    }
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    
    console.log('\n🚨 TROUBLESHOOTING STEPS:');
    console.log('1. Make sure admin backend is running on port 9000');
    console.log('2. Check if your user-side app is trying to connect to a different port');
    console.log('3. Verify CORS settings allow your user-side domain');
    console.log('4. Check browser network tab for failed requests');
  }
}

testUserConnection();