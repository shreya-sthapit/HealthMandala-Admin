const net = require('net');

function findAvailablePort(startPort = 3000) {
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

findAvailablePort(9000).then(port => {
  console.log(`Available port found: ${port}`);
  process.exit(0);
}).catch(err => {
  console.error('Error finding port:', err);
  process.exit(1);
});