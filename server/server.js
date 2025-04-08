import express from "express";
import http from "http";
import { Server } from "socket.io";
import * as data from "./data.js";
import * as colors from "./colors.js";
const PORT = process.env.PORT || 9000;

const app = express();

app.use(express.static("public"));
app.use(express.json());

app.use((req, _res, next) => {
  const timestamp = new Date(Date.now());
  console.log(
    `[${timestamp.toDateString()} ${timestamp.toTimeString()}] / ${timestamp.toISOString()}`
  );
  console.log(req.method, req.hostname, req.path);
  console.log("headers:", req.headers);
  console.log("body:", req.body);
  next();
});

const httpServer = http.createServer(app);
const io = new Server(httpServer, {});

const getRoomUsers = async (io, roomName) => {
  const sockets = await io.in(roomName).fetchSockets();
  const uniqueUsers = new Map();
  
  sockets.forEach((socket) => {
    const { userName, color } = socket.data || {};
    if (userName && color) {
      uniqueUsers.set(userName, { userName, color });
    }
  });
  
  return Array.from(uniqueUsers.values());
};

io.on("connect", (socket) => {
  console.log("New connection", socket.id);

  socket.on("request users", async ({ roomName }) => {
    const users = await getRoomUsers(io, roomName);
    socket.emit("room users", users);
  });

  socket.on("join", async (joinInfo) => {
    const { roomName, userName } = joinInfo;

    if (data.isUserNameTaken(userName)) {
      joinInfo.error = `The name ${userName} is already taken`;
      socket.emit("join-response", joinInfo);
      return;
    }

    joinInfo.color = colors.getRandomColor();
    data.registerUser(userName);
    socket.data = joinInfo;
    socket.join(roomName);

    const users = await getRoomUsers(io, roomName);
    io.to(roomName).emit("room users", users);

    socket.broadcast.to(roomName).emit("user activity", {
      type: "join",
      userName,
      color: joinInfo.color,
    });

    socket.broadcast.to(roomName).emit('user joined', {
      userName: userName,
      timestamp: new Date()
    });

    data.addMessage(roomName, {
      sender: "",
      text: `${userName} has joined the room`,
      timestamp: Date.now(),
      color: joinInfo.color,
    });
    io.to(roomName).emit("chat update", data.roomLog(roomName));
    
    socket.emit("join-response", joinInfo);
  });

  socket.on("message", (text) => {
    const { roomName, userName, color } = socket.data;
    const messageInfo = {
      sender: userName,
      text,
      color,
      timestamp: Date.now(),
    };
    data.addMessage(roomName, messageInfo);
    io.to(roomName).emit("chat update", data.roomLog(roomName));
  });

  socket.on("typing", typingInfo => {
    const { roomName, userName, isTyping } = typingInfo;
    if (!roomName || !userName) return;

    data.updateTypingStatus(roomName, userName, isTyping);
    const typingUsers = data.getTypingUsers(roomName) || [];
    io.to(roomName).emit("typing", typingUsers);
  });

  socket.on("edit", (editInfo) => {
    const { roomName, userName, text, originalTimestamp } = editInfo;
    const log = data.roomLog(roomName);
    for (let i = log.length - 1; i >= 0; i--) {
      if (
        log[i].sender === userName &&
        log[i].timestamp === originalTimestamp &&
        !log[i].deletedAt
      ) {
        log[i].text = text;
        log[i].editedAt = Date.now();
        io.to(roomName).emit("edit", log[i]);
        break;
      }
    }
  });

  socket.on("delete", (deleteInfo) => {
    const { roomName, userName } = deleteInfo;
    const log = data.roomLog(roomName);
    for (let i = log.length - 1; i >= 0; i--) {
      if (log[i].sender === userName && !log[i].deletedAt) {
        log[i].text = "";
        log[i].deletedAt = Date.now();
        break;
      }
    }
    io.to(roomName).emit("chat update", log);
  });

  socket.on("disconnect", () => {
    const { userName, roomName, color } = socket.data || {};
    if (!userName || !roomName) return;

    data.unregisterUser(userName);
    colors.releaseColor(color);

    io.to(roomName).emit("user activity", {
      type: "leave",
      userName,
      timestamp: Date.now(),
    });

    data.addMessage(roomName, {
      sender: "",
      text: `${userName} has left the room`,
      timestamp: Date.now(),
    });
    io.to(roomName).emit("chat update", data.roomLog(roomName));

    io.in(roomName)
    .fetchSockets()
    .then((sockets) => {
      const seen = new Set();
      const users = [];

      sockets.forEach((s) => {
        const { userName, color } = s.data || {};
        if (!userName || !color || seen.has(userName)) return;
        seen.add(userName);
        users.push({ userName, color });
      });

      io.to(roomName).emit("room users", users);
    });
  });
});

httpServer.listen(PORT, () => console.log(`Listening on port ${PORT}`));