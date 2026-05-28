require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const MongoDB = require('./mongodb');
const net = require('net');
const path = require('path');

const app = express();
const db = new MongoDB();

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Proxy endpoint for images from main backend
app.get('/proxy-image/*', async (req, res) => {
  try {
    const imagePath = req.params[0]; // Gets everything after /proxy-image/
    const imageUrl = `http://localhost:5001/${imagePath}`;
    
    console.log('Proxying image:', imageUrl);
    
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(imageUrl);
    
    if (response.ok) {
      const buffer = await response.arrayBuffer();
      const contentType = response.headers.get('content-type') || 'image/jpeg';
      res.set('Content-Type', contentType);
      res.set('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
      res.send(Buffer.from(buffer));
    } else {
      console.log('Image not found:', imageUrl);
      res.status(404).send('Image not found');
    }
  } catch (error) {
    console.error('Image proxy error:', error);
    res.status(500).send('Error fetching image');
  }
});

// Function to find available port
function findAvailablePort(startPort = 9000) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    
    server.listen(startPort, () => {
      const port = server.address().port;
      server.close(() => {
        resolve(port);
      });
    });
    
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        findAvailablePort(startPort + 1).then(resolve).catch(reject);
      } else {
        reject(err);
      }
    });
  });
}

// JWT Secret from environment
const JWT_SECRET = process.env.JWT_SECRET || 'Reema$TH@PIT00000';

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000', 
    'http://localhost:3001', 
    'http://localhost:5000',
    'http://localhost:5001',
    'http://localhost:8000',
    'http://localhost:8080',
    'http://10.21.10.248:3000',
    'http://10.21.10.248:3001',
    /^http:\/\/10\.\d+\.\d+\.\d+:\d+$/,  // Allow any 10.x.x.x IP with any port
    /^http:\/\/192\.168\.\d+\.\d+:\d+$/  // Allow any 192.168.x.x IP with any port
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Initialize database connection
let dbConnected = false;
db.connect().then(() => {
  dbConnected = true;
}).catch(err => {
  console.error('Failed to connect to database:', err);
});

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, admin) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.admin = admin;
    next();
  });
};

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Backend server is running!',
    database: dbConnected ? 'Connected to MongoDB Atlas' : 'Disconnected'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: dbConnected ? 'Connected to MongoDB Atlas' : 'Disconnected'
  });
});

// Admin login
app.post('/api/admin/login', async (req, res) => {
  try {
    if (!dbConnected) {
      return res.status(500).json({ message: 'Database connection error' });
    }

    const { email, password } = req.body;

    // Find admin in MongoDB admininfo collection
    const admin = await db.getAdminByEmail(email);
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: admin._id.toString(), email: admin.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name || 'Admin User'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify token
app.get('/api/admin/verify', authenticateToken, async (req, res) => {
  try {
    if (!dbConnected) {
      return res.status(500).json({ valid: false, message: 'Database connection error' });
    }

    const admin = await db.getAdminById(req.admin.id);
    if (!admin) {
      return res.status(404).json({ valid: false });
    }

    res.json({
      valid: true,
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name || 'Admin User'
      }
    });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ valid: false });
  }
});

// Get dashboard statistics
app.get('/api/admin/stats', authenticateToken, async (req, res) => {
  try {
    if (!dbConnected) {
      return res.status(500).json({ message: 'Database connection error' });
    }

    const database = db.db;
    
    // Get patient count from PatientRegistration collection
    const patientCount = await database.collection('PatientRegistration').countDocuments();
    
    // Get doctor count from DoctorRegistration collection
    const doctorCount = await database.collection('DoctorRegistration').countDocuments();
    
    // Get pending appointments from Appointments collection
    const pendingAppointments = await database.collection('Appointments').countDocuments({ 
      $or: [
        { status: { $in: ['pending', 'requested', 'pending-admin'] } },
        { status: { $exists: false } },
        { status: null }
      ]
    });
    
    // Get pending doctor approvals
    const pendingDoctorApprovals = await database.collection('DoctorRegistration').countDocuments({ 
      $or: [
        { isApproved: false },
        { isApproved: { $exists: false } }
      ]
    });
    
    // Get pending patient approvals
    const pendingPatientApprovals = await database.collection('PatientRegistration').countDocuments({ 
      $or: [
        { isApproved: false },
        { isApproved: { $exists: false } }
      ]
    });

    // Get approved appointments count
    const approvedAppointments = await database.collection('Appointments').countDocuments({ 
      status: 'approved'
    });

    res.json({
      patientCount,
      doctorCount,
      pendingAppointments,
      approvedAppointments,
      pendingDoctorApprovals,
      pendingPatientApprovals,
      totalUsers: patientCount + doctorCount
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'Error fetching statistics' });
  }
});

// Get recent activities
app.get('/api/admin/recent-activities', authenticateToken, async (req, res) => {
  try {
    if (!dbConnected) {
      return res.status(500).json({ message: 'Database connection error' });
    }

    const database = db.db;
    
    // Get recent doctor registrations
    const recentDoctors = await database.collection('DoctorRegistration')
      .find({})
      .sort({ createdAt: -1, updatedAt: -1 })
      .limit(5)
      .toArray();
    
    // Get recent patient registrations
    const recentPatients = await database.collection('PatientRegistration')
      .find({})
      .sort({ createdAt: -1, updatedAt: -1 })
      .limit(5)
      .toArray();
    
    // Get recent appointments
    const recentAppointments = await database.collection('Appointments')
      .find({})
      .sort({ createdAt: -1, updatedAt: -1 })
      .limit(5)
      .toArray();

    // Combine and format activities
    const activities = [];
    
    recentDoctors.forEach(doctor => {
      activities.push({
        type: 'doctor_registration',
        message: `Dr. ${doctor.firstName || 'Unknown'} ${doctor.lastName || 'Doctor'} registered`,
        timestamp: doctor.createdAt || doctor.updatedAt || new Date(),
        status: doctor.isApproved ? 'approved' : 'pending',
        id: doctor._id
      });
    });
    
    recentPatients.forEach(patient => {
      activities.push({
        type: 'patient_registration',
        message: `${patient.firstName || 'Unknown'} ${patient.lastName || 'Patient'} registered as patient`,
        timestamp: patient.createdAt || patient.updatedAt || new Date(),
        status: patient.isApproved ? 'approved' : 'pending',
        id: patient._id
      });
    });
    
    recentAppointments.forEach(appointment => {
      activities.push({
        type: 'appointment',
        message: `New appointment request`,
        timestamp: appointment.createdAt || appointment.updatedAt || new Date(),
        status: appointment.status || 'pending',
        id: appointment._id
      });
    });

    // Sort by timestamp and limit to 10 most recent
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.json(activities.slice(0, 10));
  } catch (error) {
    console.error('Recent activities error:', error);
    res.status(500).json({ message: 'Error fetching recent activities' });
  }
});

// Get pending appointments for approval
app.get('/api/admin/pending-appointments', authenticateToken, async (req, res) => {
  try {
    if (!dbConnected) {
      return res.status(500).json({ message: 'Database connection error' });
    }

    const database = db.db;
    
    const pendingAppointments = await database.collection('Appointments')
      .find({ 
        $or: [
          { status: { $in: ['pending', 'requested', 'pending-admin'] } },
          { status: { $exists: false } },
          { status: null }
        ]
      })
      .sort({ createdAt: -1, updatedAt: -1 })
      .toArray();

    res.json(pendingAppointments);
  } catch (error) {
    console.error('Pending appointments error:', error);
    res.status(500).json({ message: 'Error fetching pending appointments' });
  }
});

// Get approved appointments
app.get('/api/admin/approved-appointments', authenticateToken, async (req, res) => {
  try {
    if (!dbConnected) {
      return res.status(500).json({ message: 'Database connection error' });
    }

    const database = db.db;
    
    const approvedAppointments = await database.collection('Appointments')
      .find({ status: 'approved' })
      .sort({ updatedAt: -1 })
      .toArray();

    res.json(approvedAppointments);
  } catch (error) {
    console.error('Approved appointments error:', error);
    res.status(500).json({ message: 'Error fetching approved appointments' });
  }
});

// Get all appointments (for overview)
app.get('/api/admin/all-appointments', authenticateToken, async (req, res) => {
  try {
    if (!dbConnected) {
      return res.status(500).json({ message: 'Database connection error' });
    }

    const database = db.db;
    
    const allAppointments = await database.collection('Appointments')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.json(allAppointments);
  } catch (error) {
    console.error('All appointments error:', error);
    res.status(500).json({ message: 'Error fetching all appointments' });
  }
});

// Approve/Reject appointment
app.put('/api/admin/appointment/:id/status', authenticateToken, async (req, res) => {
  try {
    if (!dbConnected) {
      return res.status(500).json({ message: 'Database connection error' });
    }

    const { id } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'
    const { ObjectId } = require('mongodb');
    
    const database = db.db;
    
    const result = await database.collection('Appointments').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          status: status,
          updatedAt: new Date(),
          approvedBy: req.admin.id
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json({ message: `Appointment ${status} successfully` });
  } catch (error) {
    console.error('Appointment status update error:', error);
    res.status(500).json({ message: 'Error updating appointment status' });
  }
});

// Get pending doctor approvals
app.get('/api/admin/pending-doctors', authenticateToken, async (req, res) => {
  try {
    if (!dbConnected) {
      return res.status(500).json({ message: 'Database connection error' });
    }

    const database = db.db;
    
    const pendingDoctors = await database.collection('DoctorRegistration')
      .find({ 
        $or: [
          { isApproved: false },
          { isApproved: { $exists: false } }
        ]
      })
      .sort({ createdAt: -1, updatedAt: -1 })
      .toArray();

    res.json(pendingDoctors);
  } catch (error) {
    console.error('Pending doctors error:', error);
    res.status(500).json({ message: 'Error fetching pending doctors' });
  }
});

// Approve/Reject doctor
app.put('/api/admin/doctor/:id/approval', authenticateToken, async (req, res) => {
  try {
    if (!dbConnected) {
      return res.status(500).json({ message: 'Database connection error' });
    }

    const { id } = req.params;
    const { approved } = req.body; // true or false
    const { ObjectId } = require('mongodb');
    
    const database = db.db;
    
    const result = await database.collection('DoctorRegistration').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          isApproved: approved,
          status: approved ? 'approved' : 'rejected',
          updatedAt: new Date(),
          approvedBy: req.admin.id
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json({ message: `Doctor ${approved ? 'approved' : 'rejected'} successfully` });
  } catch (error) {
    console.error('Doctor approval error:', error);
    res.status(500).json({ message: 'Error updating doctor approval' });
  }
});

// User profile status endpoint (for user-side application)
app.get('/api/user/profile-status/:email', async (req, res) => {
  try {
    if (!dbConnected) {
      return res.status(500).json({ message: 'Database connection error' });
    }

    const { email } = req.params;
    const database = db.db;
    
    // Check if user exists as a patient
    const patient = await database.collection('PatientRegistration')
      .findOne({ email: email });
    
    // Check if user exists as a doctor
    const doctor = await database.collection('DoctorRegistration')
      .findOne({ email: email });
    
    if (patient) {
      return res.json({
        registered: true,
        type: 'patient',
        status: patient.status || 'pending',
        isApproved: patient.isApproved || false,
        profile: {
          id: patient._id,
          firstName: patient.firstName,
          lastName: patient.lastName,
          email: patient.email,
          profilePhoto: patient.profilePhoto,
          createdAt: patient.createdAt,
          updatedAt: patient.updatedAt
        }
      });
    }
    
    if (doctor) {
      return res.json({
        registered: true,
        type: 'doctor',
        status: doctor.status || 'pending',
        isApproved: doctor.isApproved || false,
        profile: {
          id: doctor._id,
          firstName: doctor.firstName,
          lastName: doctor.lastName,
          email: doctor.email,
          specialization: doctor.specialization,
          profilePhoto: doctor.profilePhoto,
          createdAt: doctor.createdAt,
          updatedAt: doctor.updatedAt
        }
      });
    }
    
    // User not found in either collection
    return res.json({
      registered: false,
      type: null,
      status: 'not_registered',
      isApproved: false,
      profile: null
    });
    
  } catch (error) {
    console.error('Profile status error:', error);
    res.status(500).json({ message: 'Error checking profile status' });
  }
});

// Check registration status by user ID (alternative endpoint)
app.get('/api/user/registration-status/:userId', async (req, res) => {
  try {
    if (!dbConnected) {
      return res.status(500).json({ message: 'Database connection error' });
    }

    const { userId } = req.params;
    const { ObjectId } = require('mongodb');
    const database = db.db;
    
    // Check if user exists as a patient
    const patient = await database.collection('PatientRegistration')
      .findOne({ userId: userId });
    
    // Check if user exists as a doctor
    const doctor = await database.collection('DoctorRegistration')
      .findOne({ userId: userId });
    
    if (patient) {
      return res.json({
        registered: true,
        type: 'patient',
        status: patient.status || 'pending',
        isApproved: patient.isApproved || false,
        registrationComplete: true,
        message: patient.status === 'approved' ? 'Your profile has been approved!' : 'Your profile is under review.',
        profile: {
          id: patient._id,
          firstName: patient.firstName,
          lastName: patient.lastName,
          email: patient.email,
          profilePhoto: patient.profilePhoto
        }
      });
    }
    
    if (doctor) {
      return res.json({
        registered: true,
        type: 'doctor',
        status: doctor.status || 'pending',
        isApproved: doctor.isApproved || false,
        registrationComplete: true,
        message: doctor.status === 'approved' ? 'Your profile has been approved!' : 'Your profile is under review.',
        profile: {
          id: doctor._id,
          firstName: doctor.firstName,
          lastName: doctor.lastName,
          email: doctor.email,
          specialization: doctor.specialization,
          profilePhoto: doctor.profilePhoto
        }
      });
    }
    
    // User not found in either collection
    return res.json({
      registered: false,
      type: null,
      status: 'not_registered',
      isApproved: false,
      registrationComplete: false,
      message: 'Please complete your registration to view your profile.',
      profile: null
    });
    
  } catch (error) {
    console.error('Registration status error:', error);
    res.status(500).json({ message: 'Error checking registration status' });
  }
});

// Get approved doctors
app.get('/api/admin/approved-doctors', authenticateToken, async (req, res) => {
  try {
    if (!dbConnected) {
      return res.status(500).json({ message: 'Database connection error' });
    }

    const database = db.db;
    
    const approvedDoctors = await database.collection('DoctorRegistration')
      .find({ isApproved: true })
      .sort({ updatedAt: -1, createdAt: -1 })
      .toArray();

    res.json(approvedDoctors);
  } catch (error) {
    console.error('Approved doctors error:', error);
    res.status(500).json({ message: 'Error fetching approved doctors' });
  }
});

// Get approved patients
app.get('/api/admin/approved-patients', authenticateToken, async (req, res) => {
  try {
    if (!dbConnected) {
      return res.status(500).json({ message: 'Database connection error' });
    }

    const database = db.db;
    
    const approvedPatients = await database.collection('PatientRegistration')
      .find({ isApproved: true })
      .sort({ updatedAt: -1, createdAt: -1 })
      .toArray();

    res.json(approvedPatients);
  } catch (error) {
    console.error('Approved patients error:', error);
    res.status(500).json({ message: 'Error fetching approved patients' });
  }
});

// Approve/Reject patient
app.put('/api/admin/patient/:id/approval', authenticateToken, async (req, res) => {
  try {
    if (!dbConnected) {
      return res.status(500).json({ message: 'Database connection error' });
    }

    const { id } = req.params;
    const { approved } = req.body; // true or false
    const { ObjectId } = require('mongodb');
    
    const database = db.db;
    
    const result = await database.collection('PatientRegistration').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          isApproved: approved,
          status: approved ? 'approved' : 'rejected',
          updatedAt: new Date(),
          approvedBy: req.admin.id
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json({ message: `Patient ${approved ? 'approved' : 'rejected'} successfully` });
  } catch (error) {
    console.error('Patient approval error:', error);
    res.status(500).json({ message: 'Error updating patient approval' });
  }
});
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  await db.close();
  process.exit(0);
});

// Get pending appointments for approval
app.get('/api/admin/pending-appointments', authenticateToken, async (req, res) => {
  try {
    if (!dbConnected) {
      return res.status(500).json({ message: 'Database connection error' });
    }

    const database = db.db;
    
    const pendingAppointments = await database.collection('Appointments')
      .find({ 
        $or: [
          { status: { $in: ['pending', 'requested', 'pending-admin'] } },
          { status: { $exists: false } },
          { status: null }
        ]
      })
      .sort({ createdAt: -1, updatedAt: -1 })
      .toArray();

    res.json(pendingAppointments);
  } catch (error) {
    console.error('Pending appointments error:', error);
    res.status(500).json({ message: 'Error fetching pending appointments' });
  }
});

// Get approved appointments
app.get('/api/admin/approved-appointments', authenticateToken, async (req, res) => {
  try {
    if (!dbConnected) {
      return res.status(500).json({ message: 'Database connection error' });
    }

    const database = db.db;
    
    const approvedAppointments = await database.collection('Appointments')
      .find({ status: 'approved' })
      .sort({ updatedAt: -1, createdAt: -1 })
      .toArray();

    res.json(approvedAppointments);
  } catch (error) {
    console.error('Approved appointments error:', error);
    res.status(500).json({ message: 'Error fetching approved appointments' });
  }
});

// Get all appointments (for overview)
app.get('/api/admin/all-appointments', authenticateToken, async (req, res) => {
  try {
    if (!dbConnected) {
      return res.status(500).json({ message: 'Database connection error' });
    }

    const database = db.db;
    
    const allAppointments = await database.collection('Appointments')
      .find({})
      .sort({ createdAt: -1, updatedAt: -1 })
      .toArray();

    res.json(allAppointments);
  } catch (error) {
    console.error('All appointments error:', error);
    res.status(500).json({ message: 'Error fetching all appointments' });
  }
});

// Approve/Reject appointment
app.put('/api/admin/appointment/:id/status', authenticateToken, async (req, res) => {
  try {
    if (!dbConnected) {
      return res.status(500).json({ message: 'Database connection error' });
    }

    const { id } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'
    const { ObjectId } = require('mongodb');
    
    const database = db.db;
    
    const result = await database.collection('Appointments').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          status: status,
          updatedAt: new Date(),
          approvedBy: req.admin.id
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json({ message: `Appointment ${status} successfully` });
  } catch (error) {
    console.error('Appointment status update error:', error);
    res.status(500).json({ message: 'Error updating appointment status' });
  }
});

// Get pending doctor approvals
app.get('/api/admin/pending-doctors', authenticateToken, async (req, res) => {
  try {
    if (!dbConnected) {
      return res.status(500).json({ message: 'Database connection error' });
    }

    const database = db.db;
    
    const pendingDoctors = await database.collection('DoctorRegistration')
      .find({ 
        $or: [
          { isApproved: false },
          { isApproved: { $exists: false } }
        ]
      })
      .sort({ createdAt: -1, updatedAt: -1 })
      .toArray();

    res.json(pendingDoctors);
  } catch (error) {
    console.error('Pending doctors error:', error);
    res.status(500).json({ message: 'Error fetching pending doctors' });
  }
});

// Get pending patient approvals
app.get('/api/admin/pending-patients', authenticateToken, async (req, res) => {
  try {
    if (!dbConnected) {
      return res.status(500).json({ message: 'Database connection error' });
    }

    const database = db.db;
    
    const pendingPatients = await database.collection('PatientRegistration')
      .find({ 
        $or: [
          { isApproved: false },
          { isApproved: { $exists: false } }
        ]
      })
      .sort({ createdAt: -1, updatedAt: -1 })
      .toArray();

    res.json(pendingPatients);
  } catch (error) {
    console.error('Pending patients error:', error);
    res.status(500).json({ message: 'Error fetching pending patients' });
  }
});

// Get pending hospital partners
app.get('/api/admin/pending-hospitals', authenticateToken, async (req, res) => {
  try {
    if (!dbConnected) return res.status(500).json({ message: 'Database connection error' });
    const database = db.db;
    const pendingHospitals = await database.collection('HospitalPartners')
      .find({ $or: [{ status: 'under_review' }, { status: { $exists: false } }] })
      .sort({ createdAt: -1 })
      .toArray();
    res.json(pendingHospitals);
  } catch (error) {
    console.error('Pending hospitals error:', error);
    res.status(500).json({ message: 'Error fetching pending hospitals' });
  }
});

// Get approved hospital partners
app.get('/api/admin/approved-hospitals', authenticateToken, async (req, res) => {
  try {
    if (!dbConnected) return res.status(500).json({ message: 'Database connection error' });
    const database = db.db;
    const approvedHospitals = await database.collection('HospitalPartners')
      .find({ status: 'approved' })
      .sort({ updatedAt: -1 })
      .toArray();
    res.json(approvedHospitals);
  } catch (error) {
    console.error('Approved hospitals error:', error);
    res.status(500).json({ message: 'Error fetching approved hospitals' });
  }
});

// Approve/Reject hospital partner
app.put('/api/admin/hospital/:id/approval', authenticateToken, async (req, res) => {
  try {
    if (!dbConnected) return res.status(500).json({ message: 'Database connection error' });
    
    const { id } = req.params;
    const { approved } = req.body;
    const { ObjectId } = require('mongodb');
    const database = db.db;
    
    const result = await database.collection('HospitalPartners').updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: approved ? 'approved' : 'rejected', updatedAt: new Date(), approvedBy: req.admin.id } }
    );
    
    if (result.matchedCount === 0) return res.status(404).json({ message: 'Hospital not found' });
    
    // Send invite email when approved
    if (approved) {
      const hospital = await database.collection('HospitalPartners').findOne({ _id: new ObjectId(id) });
      if (hospital && !hospital.inviteEmailSent) {
        try {
          const jwt = require('jsonwebtoken');
          const nodemailer = require('nodemailer');
          
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.EMAIL_USER || 'info.healthmandala@gmail.com',
              pass: process.env.EMAIL_PASS || 'nmno mxwe anlt yzpb'
            }
          });
          
          const inviteToken = jwt.sign(
            {
              hospitalId: hospital._id,
              hospitalName: hospital.hospitalName,
              adminName: hospital.adminName,
              officialEmail: hospital.officialEmail
            },
            process.env.JWT_SECRET || 'Reema$TH@PIT00000',
            { expiresIn: '48h' }
          );
          
          const setPasswordUrl = `${process.env.FRONTEND_URL || 'http://10.24.7.67:3000'}/hospital/set-password?token=${inviteToken}`;
          
          await transporter.sendMail({
            from: 'HealthMandala <info.healthmandala@gmail.com>',
            to: hospital.officialEmail,
            subject: 'Welcome to HealthMandala!',
            html: `
              <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:40px 24px;color:#1a1a1a;">
                <h2 style="color:#00897b;font-size:1.4rem;margin:0 0 24px;">Welcome to HealthMandala!</h2>
                <p style="margin:0 0 12px;">Dear <strong>${hospital.adminName}</strong>,</p>
                <p style="margin:0 0 12px;line-height:1.6;">
                  We're pleased to inform you that <strong>${hospital.hospitalName}</strong>'s partnership
                  application has been <strong>approved</strong>.
                </p>
                <p style="margin:0 0 28px;line-height:1.6;">
                  Please click the button below to set your password and activate your hospital admin account:
                </p>
                <div style="text-align:center;margin:0 0 28px;">
                  <a href="${setPasswordUrl}"
                     style="display:inline-block;padding:14px 36px;background:#00897b;color:#ffffff;text-decoration:none;border-radius:6px;font-size:1rem;font-weight:600;">
                    Set Your Password
                  </a>
                </div>
                <p style="font-size:0.875rem;color:#555;margin:0 0 32px;line-height:1.6;">
                  This link will expire in <strong>48 hours</strong>. If you did not expect this email, please ignore it.
                </p>
                <hr style="border:none;border-top:1px solid #e0e0e0;margin:0 0 16px;" />
                <p style="font-size:0.8rem;color:#999;margin:0;">HealthMandala — Connecting Healthcare</p>
              </div>
            `
          });
          
          // Mark email as sent
          await database.collection('HospitalPartners').updateOne(
            { _id: new ObjectId(id) },
            { $set: { inviteEmailSent: true } }
          );
          
          console.log(`✅ Invite email sent to ${hospital.officialEmail}`);
        } catch (emailErr) {
          console.error('❌ Invite email failed:', emailErr.message);
          // Don't block approval if email fails
        }
      }
    }
    
    res.json({ message: `Hospital ${approved ? 'approved' : 'rejected'} successfully` });
  } catch (error) {
    console.error('Hospital approval error:', error);
    res.status(500).json({ message: 'Error updating hospital approval' });
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  await db.close();
  process.exit(0);
});

// Start server with dynamic port finding
async function startServer() {
  try {
    const PORT = await findAvailablePort(9000);
    
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`MongoDB URI: ${process.env.MONGODB_URI ? 'Connected to Atlas' : 'Using local MongoDB'}`);
      console.log(`\n📊 Admin Dashboard Backend Ready!`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}`);
      console.log(`🔐 Admin Login: admin@gmail.com / admin123`);
      console.log(`\n⚠️  IMPORTANT: Update your frontend to use port ${PORT}`);
      console.log(`\n🔧 To update frontend, run these commands:`);
      console.log(`   cd ../frontend/src`);
      console.log(`   find . -name "*.js" -exec sed -i '' 's/localhost:[0-9]*/localhost:${PORT}/g' {} +`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();