const path = require('path');
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');

const { HOST, PORT } = require('./configs/config');

const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", "views");

// Middlewares

// Routes
app.get("/", (req, res) => {
	res.render("index");
})

app.all("*", (_, res) => {
	res.render("notFound");
})

// Server
const httpServer = createServer(app);
const io = new Server(httpServer, {
	cors: {
		origin: '*',
		methods: ['POST', 'PUT', 'GET'],
		credentials: true
	}
});

httpServer.listen(PORT, () => {
	console.log(`Server started successfully at http://localhost:${PORT}`)
})

io.on("connection", async (socket) => {
	console.log("new connection extablished");
	// send restaurant options when customer opens app
	const options = [
		"Select 1 to Place an order",
		"Select 99 to checkout order",
		"Select 98 to see order history",
		"Select 97 to see current order",
		"Select 0 to cancel order"
	]
	socket.emit("chatOpens", options);
})
