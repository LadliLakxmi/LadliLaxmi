// keep_alive.js
const http = require('http');

const startServer = (app, port) => {
  const server = http.createServer(app);

  // Increase timeout values to 120 seconds (120000 milliseconds)
  // server.keepAliveTimeout: The number of milliseconds a socket should remain idle
  // before the server closes it. This helps with persistent connections.
  server.keepAliveTimeout = 120000;

  // server.headersTimeout: The maximum time in milliseconds the server will wait
  // for to receive HTTP headers from a client after a connection is established.
  server.headersTimeout = 120000;

  // Listening to the server
  server.listen(port, () => {
    console.log(`App is listening at ${port}`);
  });

  // Optional: Graceful shutdown for production environments
  // SIGTERM is typically sent by process managers (like Render) to terminate the process
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0); // Exit process after server closes
    });
  });

  // SIGINT is typically sent when a user presses Ctrl+C
  process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0); // Exit process after server closes
    });
  });

  return server;
};

module.exports = startServer;
