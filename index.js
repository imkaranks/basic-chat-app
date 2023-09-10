const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

app.use(express.static(__dirname + '/public'))

app.get('/', (_, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

const online = {};

io.on('connection', (socket) => {
  socket.emit('connection', socket.id);
  
  socket.on('disconnect', () => {
    io.emit('disconnected', online[socket.id]);
    io.in(socket.id).disconnectSockets();
    delete online[socket.id];
    io.emit('online_users', Object.entries(online));
  });

  socket.on('chat_message', ({ username, msg }) => {
    io.emit('chat_message', { id: socket.id, username: username, msg: msg });
  });

  socket.on('user_joined', ({id, username}) => {
    online[id] = username;
    io.emit('online_users', Object.entries(online));
    socket.broadcast.emit('user_joined', username);
  });
});

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log('listening on *:%d', port);
});