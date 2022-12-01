const mongoose = require("mongoose");

const Roomschema = new mongoose.Schema({
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

const User = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    uid:{
        type: String,
        required: true,
    },
})




const Room = mongoose.model("Room", RoomSchema);

module.exports = { Dog, User,  };