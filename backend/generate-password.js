const bcrypt = require('bcryptjs');

// Generate hashed password for 'password'
const password = 'password';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error generating hash:', err);
  } else {
    console.log('Password:', password);
    console.log('Hash:', hash);
  }
});

// You can also test other passwords:
// bcrypt.hash('admin123', saltRounds, (err, hash) => {
//   if (err) {
//     console.error('Error generating hash:', err);
//   } else {
//     console.log('Password: admin123');
//     console.log('Hash:', hash);
//   }
// });