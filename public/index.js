import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js"

const SOCKET_URL = 'http://localhost:8000';
const socket = io(SOCKET_URL);

let restaurantOptions;

socket.on("connect", () => {
    console.log("successfully connected.");
});

socket.on("chatOpens", (options) => {
    restaurantOptions = options;
    let botMessage = `<div>${restaurantOptions.map((option) => `<p>${option}</p>`).join("")}</div>`;
    receiveMessage(botMessage)
});

socket.on("menuItems", (items) => {
    let botMessage = `<div>${items.map((item) => {
        return (`<ul>
            Select ${item.itemId} to order
            <li>Dish: ${item.itemName}</li>
            <li>Price: #${item.price}</li>
        </ul>`)
    }).join("")}</div>`;
    receiveMessage(botMessage);
})

socket.on("currentOrder", (order) => {
    let botMessage = `<div>
        <p>Here's the summary of your current order (select 99 to checkout or 0 to cancel):</p>
        <p>Dish(s): ${order.items.reduce((accum, currVal) => {
        return accum + currVal.itemName + " "
    }, "")}</p>
        <p>Total Price: #${order.totalPrice}</p>
    </div>`;
    receiveMessage(botMessage);
})

socket.on("orderHistory", (orders) => {
    let botMessage = `<div>
        <p>Here's your order history:</p>
        ${orders
            .map((order) => {
                return (
                    `<p>Dish(s): ${order.items.reduce((accum, currVal) => {
                        return accum + currVal.itemName + " "
                    }, "")}</p>
                    <p>Total Price: #${order.totalPrice}</p>`
                );
            })
            .join("")
        }
    </div>`;
    receiveMessage(botMessage);
})

socket.on("message", (message) => {
    let botMessage = `<div>${message}</div>`;
    receiveMessage(botMessage);
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
    // send user's input message to the server
    socket.emit("userResponse", { option: messageText });
    // display user's input message
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