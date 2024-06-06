const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIO = require("socket.io");
const db = require("./db/db");
const ChatRoom = require("./Model/ChatRoomSchema");

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const PORT = 4000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

io.on("connection", (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);

  socket.on("createRoom", async (roomName) => {
    const newRoom = new ChatRoom({ name: roomName, messages: [] });
    await newRoom.save();

    const chatRooms = await ChatRoom.find();
    io.emit("roomsList", chatRooms);
  });

  socket.on("findRoom", async (id) => {
    const room = await ChatRoom.findById(id);
    socket.emit("foundRoom", room?.messages);
  });

  socket.on("newMessage", async (data) => {
    console.log("data>>>>>", data);

    const { room_id, message, user, timestamp } = data;
    const room = await ChatRoom.findById(room_id);
    console.log("Room>>>>>", room);
    console.log("first>>>", message);
    const newMessage = {
      text: message,
      user,
      time: `${timestamp.hour}:${timestamp.mins}`,
    };

    room.messages.push(newMessage);
    await room.save();

    io.to(room.name).emit("roomMessage", newMessage);

    const chatRooms = await ChatRoom.find();
    io.emit("roomsList", chatRooms);
    socket.emit("foundRoom", room.messages);
  });

  socket.on("disconnect", () => {
    console.log("🔥: A user disconnected");
  });
});

app.get("/api", async (req, res) => {
  const chatRooms = await ChatRoom.find();
  res.json(chatRooms);
});

server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
