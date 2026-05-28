require('dotenv').config();
const { default: fetch } = require('node-fetch');

async function testUserEndpoints() {
  try {
    console.log('🧪 Testing User Registration Status Endpoints...');
    
    // Test profile status by email
    console.log('\n1. Testing profile status by email...');
    const email = 'sthapitshreya@gmail.com';
    const emailResponse = await fetch(`http://localhost:9000/api/user/profile-status/${email}`);
    const emailData = await emailResponse.json();
    
    console.log(`📧 Email: ${email}`);
    console.log(`✅ Registered: ${emailData.registered}`);
    console.log(`✅ Type: ${emailData.type}`);
    console.log(`✅ Status: ${emailData.status}`);
    console.log(`✅ IsApproved: ${emailData.isApproved}`);
    if (emailData.profile) {
      console.log(`✅ Name: ${emailData.profile.firstName} ${emailData.profile.lastName}`);
    }
    
    // Test registration status by user ID
    console.log('\n2. Testing registration status by user ID...');
    const userId = '6979d90c150b5c25123dd390'; // Sample user ID
    const userIdResponse = await fetch(`http://localhost:9000/api/user/registration-status/${userId}`);
    const userIdData = await userIdResponse.json();
    
    console.log(`👤 User ID: ${userId}`);
    console.log(`✅ Registered: ${userIdData.registered}`);
    console.log(`✅ Type: ${userIdData.type}`);
    console.log(`✅ Status: ${userIdData.status}`);
    console.log(`✅ Registration Complete: ${userIdData.registrationComplete}`);
    console.log(`✅ Message: ${userIdData.message}`);
    
    console.log('\n🎯 USER ENDPOINTS TEST COMPLETE');
    console.log('\n📋 Integration Instructions for User-Side Application:');
    console.log('\n🔗 Option 1 - Check by Email:');
    console.log('   GET /api/user/profile-status/{email}');
    console.log('   Example: /api/user/profile-status/sthapitshreya@gmail.com');
    
    console.log('\n🔗 Option 2 - Check by User ID:');
    console.log('   GET /api/user/registration-status/{userId}');
    console.log('   Example: /api/user/registration-status/6979d90c150b5c25123dd390');
    
    console.log('\n💻 Frontend Integration Example:');
    console.log(`
// In your user profile component
const checkRegistrationStatus = async (email) => {
  try {
    const response = await fetch(\`http://localhost:9000/api/user/profile-status/\${email}\`);
    const data = await response.json();
    
    if (data.registered && data.status === 'approved') {
      // User is registered and approved
      setUserStatus('approved');
      setShowRegistrationPrompt(false);
      setUserProfile(data.profile);
    } else if (data.registered && data.status === 'pending') {
      // User is registered but pending approval
      setUserStatus('pending');
      setShowRegistrationPrompt(false);
      setMessage('Your profile is under review');
    } else {
      // User is not registered
      setUserStatus('not_registered');
      setShowRegistrationPrompt(true);
      setMessage('Please complete your registration');
    }
  } catch (error) {
    console.error('Error checking status:', error);
  }
};
    `);
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testUserEndpoints();