const mongoose = require("mongoose");
const uri =
  "mongodb+srv://dcdatabase:dcBackend@cluster0.fabuydo.mongodb.net/socket?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(uri);
const db = mongoose.connection;
db.on("connected", () => {
  console.log("Database Connected Succesfully");
});
db.on("error", (err) => {
  console.log("Error", err);
});
db.on("disconnected", () => {
  console.log("Database disConnected Succesfully");
});
