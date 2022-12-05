const mongoose = require("mongoose");

const User = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    uid:{
        type: String,
        required: false,
    },
});

const RoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  users: {
    type: [User],
    required: true,
  },
  passString: {
    type: String,
    required: true,
  }
});






const Room = mongoose.model("Room", RoomSchema);

module.exports = { Room, User,  };