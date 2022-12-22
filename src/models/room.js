const mongoose = require("mongoose");
const {User, UserSchema} = require("./user");
const {Message, MessageSchema} = require('./message')

const RoomSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  users: {
    type: [String],
  },
  pass: {
    type: String,
  },
  messages: {
    type: [MessageSchema]
  }
});

const Room = mongoose.model("Room", RoomSchema);

module.exports = {Room, User};