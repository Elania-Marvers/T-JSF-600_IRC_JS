const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

// Initialize the express app
const app = express();

// Create an HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = socketIO(server);

// Start the server
server.listen(3000, () => {
  console.log('Server listening on port 3000');
});

io.on('connection', (socket) => {
    console.log('A user connected');
  
    // Send a message to the client
    socket.emit('message', 'Welcome to the chat');
  
    // Handle messages from the client
    socket.on('message', (message) => {
      console.log('Received message from client:', message);
    });
  
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });
  