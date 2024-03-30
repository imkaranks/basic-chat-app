import { io } from "socket.io-client";
import { generateUsername } from "unique-username-generator";
import "./style.css";

const USERNAME = generateUsername();
const clientId = document.querySelector(".client__id");
const chatPeeps = document.querySelector(".chat__peeps");
const chatList = document.querySelector(".chat__list");
const chatForm = document.querySelector(".chat__form");
const selectUsers = document.querySelector(".select__users");

const socket = io("http://localhost:3000/");

const createChat = (message, author, opts = { align: "left" }) => {
  const li = document.createElement("li");
  li.className = opts.align;
  li.innerHTML = `
    <img src="https://i.pravatar.cc/100" width="32px" height="32px" />
    <div>
      <span>${author}</span>
      <span>${message}</span>
    </div>
  `;
  chatList.append(li);
};

const updateOnlinePeeps = (users) => {
  let peepsClutter = `<h2>Online 🟢 ${Object.keys(users).length}</h2>`;
  let optionsClutter = `<option value="all">All</option>`;
  for (const key in users) {
    peepsClutter += `
      <div>
        <a href='javascript:void(0)' title="Message ${users[key]}">${users[key]}</a>
      </div>
    `;
    optionsClutter += `
      <option value="${key}">${users[key]}</option>
    `;
  }
  chatPeeps.innerHTML = peepsClutter;
  selectUsers.innerHTML = optionsClutter;
};

socket.on("you joined", () => {
  clientId.textContent = `${USERNAME}: ${socket.id}`;
});

socket.on("user joined", ({ username, users }) => {
  const onlinePeeps = { ...users };
  delete onlinePeeps[socket.id];
  createChat(`joined the chat`, `${username}: `);
  updateOnlinePeeps(onlinePeeps);
});

socket.on("chat message", ({ username, message }) => {
  createChat(
    `${message}`,
    `${username}: `,
    username === USERNAME && { align: "right" }
  );
});

socket.on("disconnect user", (users) => {
  updateOnlinePeeps(users);
});

addEventListener("load", () => {
  socket.emit("you joined", USERNAME);
  createChat("joined the chat", "You");
});

chatForm.addEventListener("submit", function (event) {
  event.preventDefault();
  const chatInput = this.querySelector(".message");

  if (selectUsers.value !== "all") {
    socket.emit("chat message", {
      userId: selectUsers.value,
      message: chatInput.value,
    });
  } else {
    socket.emit("chat message", { userId: null, message: chatInput.value });
  }
  chatInput.value = "";
});
