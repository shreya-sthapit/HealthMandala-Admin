require('dotenv').config();
const { default: fetch } = require('node-fetch');

async function testUserProfileStatus() {
  try {
    console.log('🧪 Testing User Profile Status Endpoint...');
    
    // Test with known emails from the database
    const testEmails = [
      'sthapitshreya@gmail.com', // Doctor
      'shreyasthapit224@gmail.com', // Patient
      'nonexistent@example.com' // Non-existent user
    ];
    
    for (const email of testEmails) {
      console.log(`\n📧 Testing email: ${email}`);
      
      try {
        const response = await fetch(`http://localhost:9000/api/user/profile-status/${email}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ Status: ${response.status}`);
          console.log(`   Registered: ${data.registered}`);
          console.log(`   Type: ${data.type}`);
          console.log(`   Status: ${data.status}`);
          console.log(`   IsApproved: ${data.isApproved}`);
          
          if (data.profile) {
            console.log(`   Name: ${data.profile.firstName} ${data.profile.lastName}`);
            console.log(`   Profile ID: ${data.profile.id}`);
          }
        } else {
          console.log(`❌ Status: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.log(`❌ Error: ${error.message}`);
      }
    }
    
    console.log('\n🎯 USER PROFILE STATUS TEST COMPLETE');
    console.log('\n📋 How to use this endpoint in your user-side application:');
    console.log('   GET /api/user/profile-status/{email}');
    console.log('   Returns: { registered, type, status, isApproved, profile }');
    console.log('\n💡 Integration example:');
    console.log('   if (data.registered && data.status === "approved") {');
    console.log('     // Show verified profile');
    console.log('   } else if (data.registered && data.status === "pending") {');
    console.log('     // Show "under review" message');
    console.log('   } else {');
    console.log('     // Show "complete registration" message');
    console.log('   }');
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testUserProfileStatus();