const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  text: { type: String, required: true },
  time: { type: String, required: true },
  user: { type: String, required: true },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ChatRoom",
    required: true,
  },
});

module.exports = mongoose.model("Message", MessageSchema);
