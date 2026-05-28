const fs = require('fs');
const path = require('path');

function updateFrontendPort(newPort) {
  const frontendDir = path.join(__dirname, '../frontend/src');
  const filesToUpdate = [
    'components/AdminLogin.js',
    'components/AdminDashboard.js',
    'App.js'
  ];

  filesToUpdate.forEach(file => {
    const filePath = path.join(frontendDir, file);
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Replace all localhost:XXXX with localhost:newPort
      content = content.replace(/localhost:\d+/g, `localhost:${newPort}`);
      
      fs.writeFileSync(filePath, content);
      console.log(`✅ Updated ${file} to use port ${newPort}`);
    }
  });
}

// Get port from command line argument
const port = process.argv[2];
if (port) {
  updateFrontendPort(port);
  console.log(`🎉 Frontend updated to use port ${port}`);
} else {
  console.log('Usage: node update-frontend-port.js <port>');
}