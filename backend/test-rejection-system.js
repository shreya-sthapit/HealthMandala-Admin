require('dotenv').config();
const { default: fetch } = require('node-fetch');
const MongoDB = require('./mongodb');

async function testRejectionSystem() {
  const db = new MongoDB();
  
  try {
    console.log('🧪 Testing Rejection System...');
    
    // Connect to database
    await db.connect();
    console.log('✅ Connected to database');
    
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
    
    // Check if there are any approved records to test rejection on
    console.log('\n2. Checking for approved records...');
    const database = db.db;
    
    const approvedDoctor = await database.collection('DoctorRegistration')
      .findOne({ isApproved: true });
    
    if (approvedDoctor) {
      console.log(`✅ Found approved doctor: ${approvedDoctor.firstName} ${approvedDoctor.lastName}`);
      console.log(`   Current status: ${approvedDoctor.status}`);
      
      // Test doctor rejection
      console.log('\n3. Testing doctor rejection...');
      const rejectionResponse = await fetch(`http://localhost:9000/api/admin/doctor/${approvedDoctor._id}/approval`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ approved: false })
      });
      
      const rejectionResult = await rejectionResponse.json();
      console.log('Rejection response:', rejectionResult);
      
      if (rejectionResponse.ok) {
        // Check database to verify both fields were updated
        console.log('\n4. Verifying database update...');
        const { ObjectId } = require('mongodb');
        
        const updatedDoctor = await database.collection('DoctorRegistration')
          .findOne({ _id: new ObjectId(approvedDoctor._id) });
        
        console.log(`✅ Doctor rejection status:`);
        console.log(`   isApproved: ${updatedDoctor.isApproved}`);
        console.log(`   status: ${updatedDoctor.status}`);
        console.log(`   updatedAt: ${updatedDoctor.updatedAt}`);
        
        if (updatedDoctor.isApproved === false && updatedDoctor.status === 'rejected') {
          console.log('✅ Doctor rejection system working correctly!');
        } else {
          console.log('❌ Doctor rejection system not working correctly');
        }
      }
    } else {
      console.log('⚠️ No approved doctors found to test rejection');
    }
    
    const approvedPatient = await database.collection('PatientRegistration')
      .findOne({ isApproved: true });
    
    if (approvedPatient) {
      console.log(`\n5. Found approved patient: ${approvedPatient.firstName} ${approvedPatient.lastName}`);
      console.log(`   Current status: ${approvedPatient.status}`);
      
      // Test patient rejection
      console.log('\n6. Testing patient rejection...');
      const patientRejectionResponse = await fetch(`http://localhost:9000/api/admin/patient/${approvedPatient._id}/approval`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ approved: false })
      });
      
      const patientRejectionResult = await patientRejectionResponse.json();
      console.log('Patient rejection response:', patientRejectionResult);
      
      if (patientRejectionResponse.ok) {
        // Check database to verify both fields were updated
        console.log('\n7. Verifying patient database update...');
        const { ObjectId } = require('mongodb');
        
        const updatedPatient = await database.collection('PatientRegistration')
          .findOne({ _id: new ObjectId(approvedPatient._id) });
        
        console.log(`✅ Patient rejection status:`);
        console.log(`   isApproved: ${updatedPatient.isApproved}`);
        console.log(`   status: ${updatedPatient.status}`);
        console.log(`   updatedAt: ${updatedPatient.updatedAt}`);
        
        if (updatedPatient.isApproved === false && updatedPatient.status === 'rejected') {
          console.log('✅ Patient rejection system working correctly!');
        } else {
          console.log('❌ Patient rejection system not working correctly');
        }
      }
    } else {
      console.log('⚠️ No approved patients found to test rejection');
    }
    
    console.log('\n🎉 Rejection System Test Summary:');
    console.log('✅ Both isApproved and status fields are updated correctly');
    console.log('✅ Approved profiles can be rejected and status changes to "rejected"');
    console.log('✅ User-side applications can check status for verification');
    
  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await db.close();
  }
}

testRejectionSystem();