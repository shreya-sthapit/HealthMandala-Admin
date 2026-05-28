const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

// Create database file
const dbPath = path.join(__dirname, 'admin.db');
const db = new sqlite3.Database(dbPath);

// Create admins table and insert admin user
db.serialize(() => {
  // Create table
  db.run(`CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Error creating table:', err);
      return;
    }
    console.log('✅ Admins table created successfully');

    // Hash the password
    const password = 'admin123';
    const saltRounds = 10;
    
    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
      if (err) {
        console.error('Error hashing password:', err);
        return;
      }

      // Insert admin user
      const stmt = db.prepare(`INSERT OR REPLACE INTO admins (email, password, name) VALUES (?, ?, ?)`);
      stmt.run('admin@gmail.com', hashedPassword, 'Admin User', function(err) {
        if (err) {
          console.error('Error inserting admin:', err);
        } else {
          console.log('✅ Admin user created successfully!');
          console.log('Admin credentials:');
          console.log('Email: admin@gmail.com');
          console.log('Password: admin123');
        }
        
        stmt.finalize();
        
        // Close database connection
        db.close((err) => {
          if (err) {
            console.error('Error closing database:', err);
          } else {
            console.log('✅ Database setup complete!');
          }
        });
      });
    });
  });
});