const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    text: String,
    time: String,
    user: String,
  },
  { _id: false }
);

const ChatRoomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  messages: [MessageSchema],
});
const ChatRoom = mongoose.model("ChatRoom", ChatRoomSchema);
module.exports = ChatRoom;
