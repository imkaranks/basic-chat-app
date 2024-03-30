import express from "express";
import { createServer } from "http";
import cors from "cors";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
});
const port = 3000;
const users = {};

app.use(express.json());
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.get("/", (_, res) => {
  res.json({
    message: "Hello Developers!",
  });
});

io.on("connection", (socket) => {
  socket.on("you joined", (username) => {
    users[socket.id] = username;
    socket.emit("you joined");
    socket.broadcast.emit("user joined", {
      username: users[socket.id],
      users: users,
    });
  });

  socket.on("chat message", ({ userId, message }) => {
    if (userId !== null) {
      io.to([socket.id, userId]).emit("chat message", {
        username: users[socket.id] + "(private)",
        message,
      });
    } else {
      io.emit("chat message", { username: users[socket.id], message });
    }
  });

  socket.on("disconnect", () => {
    delete users[socket.id];
    io.emit("disconnect user", users);
    io.in(socket.id).disconnectSockets();
  });
});

server.listen(port, () => {
  console.log("live at http://localhost:%d", port);
});