const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io"); 
const mongoose = require("mongoose");

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const mongourl = "mongodb://127.0.0.1/my_database";
const PORT = process.env.PORT || 3000;

const start = async () => {
  try{
    await mongoose.connect(
      mongourl
    );
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  }catch (error){
    console.error(error);
    process.exit(1);
  }
};

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

// When a client connects
io.on("connection", (socket) => {
  let sockid = socket.id;
  socket.on("join",({username,roomid})=>{
    const user = {sockid, username, room};

    socket.join(user.room);

    // Welcome current user
    socket.emit("message", formatMessage(botName, "Welcome!"));

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `${user.username} has joined the chat`)
      );

    // users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });
});



