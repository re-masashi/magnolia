const http = require("http");
const express = require("express");
const socketio = require("socket.io"); 
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const {Room, User} = require("./models/room");
const moment = require("moment");
const { v4: uuidv4 } = require('uuid');
const { request } = require("https");
const { Message } = require("./models/message");

const app = express();

const mongourl = process.env['MONGO_URL'];
const PORT = process.env.PORT ||3000;

const start = async () => {

  const sys_send = "SYSTEM";
  const path = require("path");
  const app = express();
  const server = http.createServer(app);
  const io = socketio(server);  
  const cookieParser = require('cookie-parser');

  app.use('/static', express.static(path.resolve(__dirname, '../assets')));
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
  
    socket.on("joinR",async ({username,room})=>{
      const user = {sockid, username, room};
      const db_user = new User({name: username, uid: uuidv4()});
      db_user.save();
      console.log(`User ${username} joined ${room}`)
      //Update in DB
      try{
        const db_room = await Room.findOne({name: room}).lean().exec(console.log(""));
        //console.log(`Room ${db_room.name}`);

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
      }catch{
        //socket.disconnect();
      }
  
    });

    socket.on("chatMessage", async ({username, text, room, time})=>{

      console.log("Got message!"+JSON.stringify({username, text, room, time}));
      
      console.log("room name " + room)
      let msg = new Message({
        text: text,
        sender: username,
        time: time,
        room: room
      });

      await Room.updateOne({name: room}, 
          { $push: { messages: msg } }
        ).exec(console.log(""));
      
      socket.to(room).emit("message",{user:username, username: username, text:text,  time:time})
    })
  }); 

    app.get("/", async (req, res) => {
      res.render("index.ejs", {csrf: ""})
    })
    .post("/", async (req, res)=> {
      try{
        console.log(req.body)
        console.log("IN POST /")
        let room =  await Room.findOne({name:req.body.room}).lean().limit(50).exec();
        if(room == undefined){
          console.log("No room")
          res.redirect("/");

        }
        else if(req.body.pass==room.pass){
          res.cookie("username", req.body.name, {expire: Date.now()+360000})
          res.cookie("pass", req.body.pass, {expire: Date.now() + 360000});
          res.cookie("room", req.body.room, {expire: Date.now() + 360000});
          res.redirect('/chat/'+req.body.room);
        }else{
          res.send("Wrong ROOM or PASSWORD")
        }
        
      } catch (error) {
        console.log(error)
      }
    })
    .get("/createroom", async (req, res) => {
      res.render("createroom.ejs", {csrf: ""})
    })
    .post("/createroom", async (req,res)=> {
      const name = req.body.name;
      const passkey = req.body.pass;
      console.log(`ROOM-> ${req.body.name}`);
      try {
        let room =  Room.findOne({ name:name }).exec(()=>{});
        
        if (room != undefined) {
          res.send("Room already exists!");
        }
        room = new Room({
          name: name,
          pass: passkey,
          users: []
        });
        room.save();
        res.send(`Room ${name} created!`);
        console.log(room)
      } catch {

      }

    })
    .get("/chat/:roomid", async (req,res) => {
      let db_room = await Room.findOne({name:req.cookies.room}).exec();
      //console.log(req.params.roomid)
      res.render("chat.ejs", {room: req.params.roomid});
    })
    .get("/messages/:roomid", async (req,res)=> {
        try {
          if(!req.cookies.username){
            res.status = 403;
            res.json({"code": "UNAUTHORIZED. Action will be logged."});
          }
          let room =  await Room.findOne({name:req.params.roomid}).lean().limit(50).exec();
          res.json({
        "code": "OK",
        "messages": JSON.stringify(room.messages)})

        } catch (error) {
          res.status = 404;
          res.json({"code":"No such room."})
        }
    })
}; 


start();



