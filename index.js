const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const path = require('path');
const { Server } = require('socket.io');
const io = new Server(server);

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public/index.html'));
});

const online = {};

io.on('connection', (socket) => {
  console.log('User connected', online);
  
  socket.emit('connection', socket.id);
  
  socket.on('disconnect', () => {
    console.log('User disconnected');
    io.emit('disconnected', online[socket.id]);
    io.in(socket.id).disconnectSockets();
    delete online[socket.id];
    io.emit('online_users', Object.values(online));
  });

  socket.on('chat_message', ({ username, msg }) => {
    io.emit('chat_message', { id: socket.id, username: username, msg: msg });
  });

  socket.on('user_joined', ({id, username}) => {
    online[id] = username;
    io.emit('online_users', Object.values(online));
    socket.broadcast.emit('user_joined', username);
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});