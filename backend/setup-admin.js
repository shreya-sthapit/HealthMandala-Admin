require('dotenv').config();
const bcrypt = require('bcryptjs');
const MongoDB = require('./mongodb');

async function setupAdmin() {
  const db = new MongoDB();
  
  try {
    await db.connect();
    
    // Check if admin already exists
    const existingAdmin = await db.getAdminByEmail('admin@gmail.com');
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists with email: admin@gmail.com');
      return;
    }

    // Hash the password
    const password = 'admin123';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create admin user
    const adminData = {
      email: 'admin@gmail.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin',
      createdAt: new Date()
    };

    const result = await db.createAdmin(adminData);
    
    if (result.insertedId) {
      console.log('✅ Admin user created successfully in MongoDB Atlas!');
      console.log('Admin credentials:');
      console.log('Email: admin@gmail.com');
      console.log('Password: admin123');
      console.log('ID:', result.insertedId);
    }
    
  } catch (error) {
    console.error('❌ Error setting up admin:', error);
  } finally {
    await db.close();
  }
}

setupAdmin();