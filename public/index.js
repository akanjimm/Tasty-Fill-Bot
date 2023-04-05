import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js"

const SOCKET_URL = 'http://localhost:8000';
const socket = io(SOCKET_URL);

let restaurantOptions;

socket.on("connect", () => {
    console.log("successfully connected.");
})

socket.on("chatOpens", (options) => {
    restaurantOptions = options;
    let botMessage = `<div>${restaurantOptions.map((option) => `<p>${option}</p>`).join("")}</div>`;
    receiveMessage(botMessage)
})

const chatContainer = document.querySelector('.chat-container');
const chatMessages = document.querySelector('.chat-messages');
const chatInput = document.querySelector('.chat-input');
const sendButton = document.querySelector('#send-button');
const messageInput = chatInput.querySelector('input[type="text"]');

// handle message sent by the user
function sendMessage() {
    const messageText = messageInput.value.trim();
    if (messageText === '') {
        return;
    }
    const message = document.createElement('div');
    message.classList.add('message', 'sent');
    message.innerHTML = `<p>${messageText}</p>`;
    chatMessages.appendChild(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    messageInput.value = '';
}
sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

// handle message sent by the bot
function receiveMessage(botMessage) {
    const message = document.createElement('div');
    message.classList.add('message', 'received');
    message.innerHTML = botMessage;
    chatMessages.appendChild(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
// setInterval(receiveMessage, 5000);
// receiveMessage();