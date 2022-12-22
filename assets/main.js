//const moment = require("moment");

const chatForm = document.getElementById('chat-form');
const chatMessages = document.getElementById('chat-area');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');


function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}
const username = getCookie("username");

const socket = io();

// Join chatroom
socket.emit('joinR', { username, room });

// Get room and users
socket.on('users_join', ({ room, users }) => {
  outputUsers(users);
});

// Message from server
socket.on('message', (message) => {
  console.log(message);
  outputMessage(message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit
document.addEventListener('submit', function(e) {
  

  // Get message text
  let msg = document.getElementById("msg").value;

  msg = msg.trim();
  data = {name:username,  text: msg, room: room, time: moment(),};
  //console.log(moment())

  // Emit message to server
  socket.emit('chatMessage', data);
  console.log(JSON.stringify(data))
  console.log("Message sent!");
  outputMessage({user:username, time: moment().format("h:mm a"),  text: msg})
  e.preventDefault();
  return false;
  
});

// Output message to DOM
function outputMessage(msg) {
  let msg_template = `
<div class="message mb-4 flex">
  <div class="flex-2">
    <div class="w-12 h-12 relative">
      ${msg.username}
      <span class="absolute w-4 h-4 bg-gray-400 rounded-full right-0 bottom-0 border-2 border-white"></span>
    </div>
  </div>
  <div class="flex-1 px-2">
    <div class="inline-block bg-gray-300 rounded-full p-2 px-6 text-gray-700">
      <span>${msg.text}</span>
    </div>
  <div class="pl-4"><small class="text-gray-500">${msg.time}</small></div>
</div>
`
  document.getElementById("chat-area").innerHTML += msg_template;
}

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = '';
  users.forEach((user) => {
    const li = document.createElement('li');
    li.innerText = user.username;
    userList.appendChild(li);
  });
}

//Prompt the user before leave chat room