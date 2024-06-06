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
    console.log(`🛠️: Creating room with name: ${roomName}`);
    const newRoom = new ChatRoom({ name: roomName, messages: [] });
    await newRoom.save();
    console.log(`✅: Room ${roomName} created and saved to database`);

    const chatRooms = await ChatRoom.find();
    console.log(`📋: Emitting rooms list: ${chatRooms}`);
    io.emit("roomsList", chatRooms);
  });

  socket.on("findRoom", async (id) => {
    console.log(`🔍: Finding room with id: ${id}`);
    const room = await ChatRoom.findById(id);
    console.log(`🏠: Room found: ${room}`);
    socket.emit("foundRoom", room?.messages);
  });

  socket.on("newMessage", async (data) => {
    const { room_id, message, user, timestamp } = data;
    console.log(
      `💬: New message in room ${room_id}: ${message} by ${user} at ${timestamp.hour}:${timestamp.mins}`
    );
    const room = await ChatRoom.findById(room_id);
    const newMessage = {
      text: message,
      user,
      time: `${timestamp.hour}:${timestamp.mins}`,
    };

    room.messages.push(newMessage);
    await room.save();
    console.log(`✅: Message saved to room ${room_id}`);

    io.to(room.name).emit("roomMessage", newMessage);
    console.log(`📤: Message emitted to room ${room.name}`);

    const chatRooms = await ChatRoom.find();
    console.log(`📋: Emitting updated rooms list: ${chatRooms}`);
    io.emit("roomsList", chatRooms);
    console.log(`📤: Emitting messages of found room: ${room.messages}`);
    socket.emit("foundRoom", room.messages);
  });

  socket.on("disconnect", () => {
    console.log(`🔥: User ${socket.id} disconnected`);
  });
});

app.get("/api", async (req, res) => {
  console.log(`🌐: GET /api request received`);
  const chatRooms = await ChatRoom.find();
  console.log(`📋: Sending rooms list: ${chatRooms}`);
  res.json(chatRooms);
});

server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
