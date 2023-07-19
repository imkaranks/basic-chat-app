const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const path = require('path');
const { Server } = require('socket.io');
const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public/index.html'));
});

io.on('connection', (socket) => {
  console.log('User connected');

  socket.on('disconnect', () => {
    console.log('User disconnected')
  });

  socket.on('chat message', ({ username, msg }) => {
    io.emit('chat message', { username: username, msg: msg })
  });

  socket.on('user joined', (username) => {
    socket.broadcast.emit('user joined', username);
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});