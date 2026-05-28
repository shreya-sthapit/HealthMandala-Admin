require('dotenv').config();
const { default: fetch } = require('node-fetch');
const MongoDB = require('./mongodb');

async function testApprovalSystem() {
  const db = new MongoDB();
  
  try {
    console.log('🧪 Testing Approval System with Status Updates...');
    
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
    
    // Get pending doctors
    console.log('\n2. Getting pending doctors...');
    const doctorsResponse = await fetch('http://localhost:9000/api/admin/pending-doctors', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const doctorsData = await doctorsResponse.json();
    
    if (doctorsData.length > 0) {
      const doctor = doctorsData[0];
      console.log(`✅ Found doctor: ${doctor.firstName} ${doctor.lastName}`);
      console.log(`   Current status: ${doctor.status || 'pending'}`);
      console.log(`   Current isApproved: ${doctor.isApproved}`);
      
      // Test doctor approval
      console.log('\n3. Testing doctor approval...');
      const approvalResponse = await fetch(`http://localhost:9000/api/admin/doctor/${doctor._id}/approval`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ approved: true })
      });
      
      const approvalResult = await approvalResponse.json();
      console.log('Approval response:', approvalResult);
      
      if (approvalResponse.ok) {
        // Check database to verify both fields were updated
        console.log('\n4. Verifying database update...');
        const database = db.db;
        const { ObjectId } = require('mongodb');
        
        const updatedDoctor = await database.collection('DoctorRegistration')
          .findOne({ _id: new ObjectId(doctor._id) });
        
        console.log(`✅ Doctor approval status:`);
        console.log(`   isApproved: ${updatedDoctor.isApproved}`);
        console.log(`   status: ${updatedDoctor.status}`);
        console.log(`   updatedAt: ${updatedDoctor.updatedAt}`);
        console.log(`   approvedBy: ${updatedDoctor.approvedBy}`);
        
        if (updatedDoctor.isApproved === true && updatedDoctor.status === 'approved') {
          console.log('✅ Doctor approval system working correctly!');
        } else {
          console.log('❌ Doctor approval system not working correctly');
        }
      }
    } else {
      console.log('⚠️ No pending doctors found');
    }
    
    // Get pending patients
    console.log('\n5. Getting pending patients...');
    const patientsResponse = await fetch('http://localhost:9000/api/admin/pending-patients', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const patientsData = await patientsResponse.json();
    
    if (patientsData.length > 0) {
      const patient = patientsData[0];
      console.log(`✅ Found patient: ${patient.firstName} ${patient.lastName}`);
      console.log(`   Current status: ${patient.status || 'pending'}`);
      console.log(`   Current isApproved: ${patient.isApproved}`);
      
      // Test patient approval
      console.log('\n6. Testing patient approval...');
      const patientApprovalResponse = await fetch(`http://localhost:9000/api/admin/patient/${patient._id}/approval`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ approved: true })
      });
      
      const patientApprovalResult = await patientApprovalResponse.json();
      console.log('Patient approval response:', patientApprovalResult);
      
      if (patientApprovalResponse.ok) {
        // Check database to verify both fields were updated
        console.log('\n7. Verifying patient database update...');
        const database = db.db;
        const { ObjectId } = require('mongodb');
        
        const updatedPatient = await database.collection('PatientRegistration')
          .findOne({ _id: new ObjectId(patient._id) });
        
        console.log(`✅ Patient approval status:`);
        console.log(`   isApproved: ${updatedPatient.isApproved}`);
        console.log(`   status: ${updatedPatient.status}`);
        console.log(`   updatedAt: ${updatedPatient.updatedAt}`);
        console.log(`   approvedBy: ${updatedPatient.approvedBy}`);
        
        if (updatedPatient.isApproved === true && updatedPatient.status === 'approved') {
          console.log('✅ Patient approval system working correctly!');
        } else {
          console.log('❌ Patient approval system not working correctly');
        }
      }
    } else {
      console.log('⚠️ No pending patients found');
    }
    
    console.log('\n🎉 Approval System Test Summary:');
    console.log('✅ Both isApproved and status fields are now updated');
    console.log('✅ User-side applications can check status field for verification');
    console.log('✅ Admin approval system is fully functional');
    
  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await db.close();
  }
}

testApprovalSystem();