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
  console.log(`User ${socket.id} just connected`);

  socket.on("createRoom", async (roomName) => {
    try {
      const newRoom = new ChatRoom({ name: roomName, messages: [] });
      await newRoom.save();
      console.log("New room saved:", newRoom);

      const chatRooms = await ChatRoom.find();
      console.log("Chat rooms list:", chatRooms);
      io.emit("roomsList", chatRooms);
    } catch (error) {
      console.error("Error creating room:", error);
    }
  });

  socket.on("findRoom", async (id) => {
    try {
      const room = await ChatRoom.findById(id);
      socket.emit("foundRoom", room?.messages);
    } catch (error) {
      console.error("Error finding room:", error);
    }
  });

  socket.on("newMessage", async (data) => {
    console.log("Data:", data);
    try {
      const { room_id, messages, user, timestamp } = data;
      const room = await ChatRoom.findById(room_id);
      console.log("Room:", room);
      console.log("Messages:", messages);
      const newMessage = {
        text: messages,
        user,
        time: `${timestamp.hour}:${timestamp.mins}`,
      };

      room.messages.push(newMessage);
      await room.save();

      io.to(room.name).emit("roomMessage", newMessage);

      const chatRooms = await ChatRoom.find();
      io.emit("roomsList", chatRooms);
      socket.emit("foundRoom", room.messages);
    } catch (error) {
      console.error("Error creating new message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

app.get("/api", async (req, res) => {
  try {
    const chatRooms = await ChatRoom.find();
    res.json(chatRooms);
  } catch (error) {
    console.error("Error getting chat rooms:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
