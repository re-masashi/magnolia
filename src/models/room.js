const mongoose = require("mongoose");
const {User, UserSchema} = require("./user");

const RoomSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  users: {
    type: [UserSchema],
  },
  pass: {
    type: String,
  }
});

const Room = mongoose.model("Room", RoomSchema);

module.exports = {Room, User};