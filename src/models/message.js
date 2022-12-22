const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
    text: {
        type: String,
    },
    sender:{
        type: String,
    },
    time: {
        type: String
    }
});

const Message = mongoose.model("Message", MessageSchema);

module.exports = {Message, MessageSchema}