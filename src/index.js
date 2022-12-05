const {RoomSchema} = require("./models");
const http = require("http");
const html = require("html");
const express = require("express");
const socketio = require("socket.io"); 
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const app = express();

const mongourl = "mongodb://127.0.0.1/my_database";
const PORT = process.env.PORT || 3000;

const start = async () => {

  const path = require("path");
  const app = express();
  const server = http.createServer(app);
  const io = socketio(server);
  app.use(express.static(path.join(__dirname, "public")));
  app.use(bodyParser.json());

  try{
    await mongoose.connect(
      mongourl,
      { useNewUrlParser: true, useUnifiedTopology: true }
    );
    server.listen(PORT, () => console.log(`Server russssnning on port ${PORT}`));
  }catch (error){
    console.error(error);
    process.exit(1);
  }

  const db = mongoose.connection;

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

  app.use(express.static(path.join(__dirname, "public")))
    .get("/", (req, res) => res.sendFile(__dirname+"/../public/index.html"))
    //.get("/create", (req, res) => res.sendFile("./createroom.html"))
    .post("/createroom", (req,res)=> {
      const name = req.body.rname;
      const passkey = req.body.rpass;
      if(RoomSchema.find({name:name})[0]){
        
      }

    })
}; 


start();



