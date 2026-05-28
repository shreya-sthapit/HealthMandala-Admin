const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'admin.db');
const db = new sqlite3.Database(dbPath);

console.log('📊 Admin Database Contents:');
console.log('==========================');

db.all('SELECT id, email, name, created_at FROM admins', (err, rows) => {
  if (err) {
    console.error('Error reading database:', err);
  } else {
    if (rows.length === 0) {
      console.log('No admin users found in database.');
    } else {
      rows.forEach((row) => {
        console.log(`ID: ${row.id}`);
        console.log(`Email: ${row.email}`);
        console.log(`Name: ${row.name}`);
        console.log(`Created: ${row.created_at}`);
        console.log('---');
      });
    }
  }
  
  db.close();
});