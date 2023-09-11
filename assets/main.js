// const moment = require("moment");
const chatForm = document.getElementById('chat-form');
const chatArea = document.getElementById('message-list');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');


function generateUID() {
    // I generate the UID from two parts here 
    // to ensure the random number provide enough bits.
    var firstPart = (Math.random() * 46656) | 0;
    var secondPart = (Math.random() * 46656) | 0;
    firstPart = ("000" + firstPart.toString(36)).slice(-3);
    secondPart = ("000" + secondPart.toString(36)).slice(-3);
    return firstPart + secondPart;
}


// const darkmode = new Darkmode();
// if(!darkmode.isActivated()){
//  darkmode.toggle();
// }

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

let username = getCookie("username"); // not using const

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
  chatArea.scrollTop = chatArea.scrollHeight;
});

socket.on('usertyping', ({username}) => {
  document.getElementById('typing').innerHTML=username+" is typing...";
setTimeout((function(){document.getElementById('typing').innerHTML="";}),2000)
});

// Message submit
document.addEventListener('submit', function(e) {
  

  // Get message text
  let msg = document.getElementById("msg").value;

  msg = DOMPurify.sanitize(msg.trim());
  data = {username:username,  text: msg, room: room, time: moment().format("h:mm a"),};
  //console.log(moment())

  // Emit message to server
  socket.emit('chatMessage', data);
  console.log(JSON.stringify(data))
  console.log("Message sent!");
  outputMessage({username: username, time: moment().format("h:mm a"),  text: msg})
  e.preventDefault();
  document.getElementById('msg').value='';
  chatArea.scrollTop = chatArea.scrollHeight;
  return false;
  
});
document.getElementById('upload').addEventListener('click', function(e) {
  let input = document.createElement('input');
  let filename = generateUID(); 
  input.type = 'file';
  input.multiple = true;
  input.onchange = e => { 
    let data =  {data: e.target.files[0], username:username, time: moment().format("h:mm a"), room: room, filename};
    socket.emit("uploadImg", data);
  }

  input.click();
});


// Output message to DOM
function outputMessage(msg) {
  let msg_template = `
  <div class="message p-2 mb-4 flex transition duration-700 ease-in-out  ${(msg.username==username)?'text-right':''}"
    
  >
  <div class="flex-2">
      <div class="w-12 h-12 relative">
          <div class="text-gray-200">${msg.username} </div>
      </div>
  </div>
  <div class="flex-1 px-2">
 <div class="${(msg.username==username)?'bg-purple-700':'bg-gray-900'} inline-block ${(!msg.is_img)?'rounded-full':''}  p-2 px-6 text-gray-300">
          <span>${marked.parse(msg.text)}</span>
      </div>
      <div class="pl-4"><small class="text-gray-500">${msg.time}</small></div>
  </div>
</div>
`
  document.getElementById("message-list").innerHTML += msg_template;
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

axios.get('/messages/'+room).then((res)=>{
  console.log(res)
  JSON.parse(res.data.messages).forEach((val, index)=>{
    outputMessage({username:val.sender, time:val.time, text:val.text});
  })
})