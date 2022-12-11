const http = require("http");
const express = require("express");
const socketio = require("socket.io"); 
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const {Room, User} = require("./models/room");
const moment = require("moment");
const { v4: uuidv4 } = require('uuid');

const app = express();

const mongourl = "mongodb://127.0.0.1/my_database";
const PORT = process.env.PORT || 3000;

const start = async () => {

  const sys_send = "SYSTEM";
  const path = require("path");
  const app = express();
  const server = http.createServer(app);
  const io = socketio(server);  
  const cookieParser = require('cookie-parser');

  app.use(express.static(path.resolve(__dirname+"/../views")));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.engine('html', require('ejs').renderFile)
  app.set("view engine", "html");
  app.use(cookieParser('IDoWhatIWant,Truly'));

  try{
    await mongoose.connect(
      mongourl,
      { useNewUrlParser: true, useUnifiedTopology: true }
    );
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  }catch (error){
    console.error(error);
    process.exit(1);
  }

  const db = mongoose.connection;

  io.on("connection", (socket) => {
    let sockid = socket.id;
    const format = (username, text) => {
        return {
          username,
          text,
          time: moment().format('h:mm a')
        };
    }
  
    socket.on("joinR",({username,roomid})=>{
      const user = {sockid, username, room};
      const db_user = new User({name: username, uid: uuidv4()});
      
      //Update in DB
      const db_room = Room.findOne({name: room});
      db_room.users.push(user);
  
      socket.join(user.room);

      // Welcome current user
      socket.emit("message", format(sys_send,`Welcome to Magnolia [${room}]`));
  
      // Broadcast when a user connects
      socket.broadcast
        .to(user.room)
        .emit(
          "message",
          format(sys_send, `${user.username} has joined the chat`)
        );
  
      // users and room info
      io.to(user.room).emit("users_update", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    });
  }); 

    app.get("/", async (req, res) => res.render("index.html"))
    .get("/createroom", async (req, res) => res.render("/createroom.html"))
    .post("/createroom", async (req,res)=> {
      const name = req.body.name;
      const passkey = req.body.pass;
      console.log(`ROOM-> ${req.body.pass}`);
      //try {
       // const room =  Room.findOne({ name:name });
        //console.log(room)
        //res.send("Room already exists!");
      //} catch {
        const room = new Room({
          name: name,
          pass: passkey,
          users: []
        });
        room.save();
        res.send(`Room ${name} created!`);
      //}

    })
    .get("/chat/:roomid", async (req,res) => {
      if(!req.cookies.username){
        res.cookie('username', req.query.username, {expire: 360000 + Date.now()});
      }
      res.render("chat.ejs", {room: req.params.roomid});
    })
}; 


start();



