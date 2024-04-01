import { io } from "socket.io-client";
import { generateUsername } from "unique-username-generator";
import "./style.css";

const USERNAME = generateUsername();
const chatUserId = document.querySelector(".chat__user-id");
const chatPeeps = document.querySelector(".chat__peeps");
const chatList = document.querySelector(".chat__list");
const chatForm = document.querySelector(".chat__form");
const chatSelectUser = document.querySelector(".chat__select-user");

const socket = io("http://localhost:3000/");

const createChat = (message, author, timestamp, opts = {}) => {
  const chatGroup = document.querySelector(".chat__group");
  const li = document.createElement("li");
  li.innerHTML = `
    <img src="https://i.pravatar.cc/50" width="32px" height="32px" />
    <div>
      <div>
        <span>${author}</span>
        ${timestamp ? `<span> • ${timestamp.toLocaleTimeString()}</span>` : ""}
      </div>
      <div>
        <p>${message}</p>
      </div>
    </div>
  `;
  chatList.append(li);
  chatGroup.scrollTop = chatGroup.scrollHeight;
};

const updateOnlinePeeps = (users) => {
  let peepsClutter = `<h2>Online 🟢 ${Object.keys(users).length}</h2>`;
  let optionsClutter = `<option value="all">to all</option>`;
  for (const key in users) {
    peepsClutter += `
      <div>
        <a href='javascript:void(0)' title="${
          key === socket.id ? "You" : `Message ${users[key]}`
        }">${users[key]}</a>
      </div>
    `;
    if (key !== socket.id) {
      optionsClutter += `
        <option value="${key}">to ${users[key]}</option>
      `;
    }
  }
  chatPeeps.innerHTML = peepsClutter;
  chatSelectUser.innerHTML = optionsClutter;
};

// socket.on("new user", () => {
//   chatUserId.textContent = `${USERNAME}: ${socket.id}`;
// });

socket.on("user joined", ({ id, username, users }) => {
  const onlinePeeps = { ...users };
  // delete onlinePeeps[socket.id];
  if (id === socket.id) {
    createChat("joined the chat", "You");
    chatUserId.textContent = `${USERNAME}: ${socket.id}`;
  } else {
    createChat(`joined the chat`, `@${username}`);
  }
  updateOnlinePeeps(onlinePeeps);
});

socket.on("chat message", ({ username, message }) => {
  if (username.includes(USERNAME)) {
    createChat(
      `${message}`,
      `${username.replace(`@${USERNAME}`, "you")}: `,
      new Date()
    );
  } else {
    createChat(`${message}`, `@${username}: `, new Date());
  }
});

socket.on("disconnect user", ({ username, users }) => {
  createChat(`left the chat`, `@${username}`);
  updateOnlinePeeps(users);
});

addEventListener("load", () => {
  const loader = document.querySelector(".loader");
  setTimeout(() => (loader.style.transform = "translateY(-100%)"), 2000);
  socket.emit("new user", USERNAME);
});

chatForm.addEventListener("submit", function (event) {
  event.preventDefault();
  const chatInput = this.querySelector(".chat__message-input");

  if (!chatInput.value.trim()) return;

  if (chatSelectUser.value !== "all") {
    socket.emit("chat message", {
      userId: chatSelectUser.value,
      to: chatSelectUser.value,
      by: socket.id,
      message: chatInput.value,
    });
  } else {
    socket.emit("chat message", { userId: null, message: chatInput.value });
  }
  chatInput.value = "";
});
