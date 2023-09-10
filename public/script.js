const user = prompt("What's your user name?") || 'Anonymous';
const socket = io();

const $users = document.getElementById('users');
const messages = document.getElementById('messages');
const form = document.getElementById('form');
const input = document.getElementById('input');

let clientUserId = null;
let prevUserId = null;

socket.on('connection', (id) => {
  clientUserId = id;
  socket.emit('user_joined', { id, username: user });
});

form.onsubmit = function (e) {
  e.preventDefault();
  if (input.value) {
    socket.emit('chat_message', { username: user, msg: input.value });
    input.value = '';
  }
};

socket.on('chat_message', ({ id, username, msg }) => {
  const $userLastMsg = document
    .getElementById(id.toString())
    .querySelector('[data-last-chat]');
  $userLastMsg.textContent = msg.length > 20 ? msg.slice(0, 20) + '...' : msg;
  messages.appendChild(createMsgItem(id, username, msg));
  messages.scrollTo(0, messages.scrollHeight);
});

socket.on('online_users', (users) => {
  document.getElementById('online-count')
    .textContent = users.length;
  let clutter = '';
  users.forEach(user => {
    clutter += `
      <li class="flex flex-wrap gap-x-2 items-center bg-neutral-700/50 text-white p-4 rounded-lg" id="${user[0]}">
        <img class="w-8 aspect-ratio rounded-full" src="https://img.freepik.com/premium-vector/happy-smiling-young-man-avatar-3d-portrait-man-cartoon-character-people-vector-illustration_653240-187.jpg" alt="">
        <div class="flex-1 min-w-[15ch]">
          <h2 class="font-medium">${user[1]}</h2>
          <p class="text-sm text-neutral-400 leading-tight" data-last-chat>joined the chat.</p>
        </div>
      </li>`;
  });
  $users.innerHTML = clutter;
});

function createMsgItem(id, username, msg) {
  const item = document.createElement('li');
  const itemMsg = document.createElement('p');
  const isUser = clientUserId === id;

  if (prevUserId === null || prevUserId !== id) {
    const itemAvatar = document.createElement('img');
    const itemName = document.createElement('span');
    itemAvatar.className = "w-8 aspect-ratio rounded-full z-10";
    itemAvatar.src = "https://img.freepik.com/premium-vector/happy-smiling-young-man-avatar-3d-portrait-man-cartoon-character-people-vector-illustration_653240-187.jpg";
    itemName.className = "text-sm";
    itemName.textContent = isUser ? 'Me' : username;
    item.appendChild(itemAvatar);
    item.appendChild(itemName);
    prevUserId = id;
  }

  item.className = isUser ? "flex flex-wrap items-center justify-end gap-2 items-end float-right clear-both" : "flex flex-wrap items-center gap-2 float-left clear-both";
  itemMsg.className = isUser ? "relative w-full bg-gradient-to-r from-sky-400 to-blue-500 text-white p-4 max-w-fit sm:max-w-[70vw] leading-tight rounded-b-2xl rounded-tl-2xl" : "relative w-full bg-gray-100 p-4 max-w-fit sm:max-w-[70vw] leading-tight rounded-b-2xl rounded-tr-2xl";
  itemMsg.textContent = `${msg}`;
  item.appendChild(itemMsg);
  return item;
}

function logMsg(msg) {
  const item = document.createElement('li');
  const itemAvatar = document.createElement('img');
  const itemMsg = document.createElement('p');
  item.className = "flex gap-4 items-end float-left clear-both";
  itemAvatar.className = "w-8 aspect-ratio rounded-xl z-10";
  itemAvatar.src = "https://img.freepik.com/premium-vector/happy-smiling-young-man-avatar-3d-portrait-man-cartoon-character-people-vector-illustration_653240-187.jpg";
  itemMsg.className = "relative bg-blue-500 text-white px-2 py-1 leading-tight rounded-t-lg rounded-br-lg before:content-[''] before:absolute before:-left-3 before:bottom-0 before:w-3 before:h-3 before:bg-blue-500 after:content-[''] after:absolute after:-left-6 after:bottom-0 after:w-6 after:aspect-square after:bg-white after:rounded-full";
  itemMsg.textContent = msg;
  item.appendChild(itemAvatar);
  item.appendChild(itemMsg);
  messages.appendChild(item);
  messages.scrollTo(0, messages.scrollHeight);
}

socket.on('user_joined', (username) => {
  logMsg(`${username} joined the chat`);
});

socket.on('disconnected', (username) => {
  logMsg(`${username} left the chat`);
});