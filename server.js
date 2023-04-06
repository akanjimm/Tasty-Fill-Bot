const path = require('path');
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const { connectToMongoDb } = require('./configs/db');

const { HOST, PORT } = require('./configs/config');
const config = require('./configs/config');
const UserModel = require('./models/user.model');
const OrderModel = require('./models/order.model');
const menuItems = require('./data/menu');

const app = express();

// setup mongodb store and session middleware
let session = require('express-session');
let MongoDBStore = require('connect-mongodb-session')(session);

let store = new MongoDBStore({
	uri: config.MONGO_DB_CONNECTION_URL,
	databaseName: config.DB_NAME,
	collection: config.COLLECTION_NAME
});

store.on("error", function (error) {
	console.log("MongoDB store error", error);
});

let sess = {
	secret: config.SESSION_SECRET,
	cookie: {
		maxAge: parseInt(config.COOKIE_MAX_AGE)
	},
	store: store,
	resave: true,
	saveUninitialized: true
}

if (process.env.NODE_ENV === 'production') {
	app.set('trust proxy', 1);
	sess.cookie.secure = true;
	sess.cookie.httpOnly = true;
	sess.cookie.domain = "" // REPLACE: live domain
}

// Middlewares
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", "views");
app.use(session(sess));


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
		methods: ['POST', 'GET'],
		credentials: true
	}
});

connectToMongoDb();
httpServer.listen(PORT, () => {
	console.log(`Server started successfully at port ${PORT}`);
})

// socket session middleware
// convert a connect middleware to a Socket.IO middleware
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
io.use(wrap(session(sess)));


io.on("connection", async (socket) => {
	const session = socket.request.session;
	let user;
	if (session.user) {
		user = await UserModel.findOne({ userId: session.user });
		console.log("welcome back", session.user);
	} else {
		session.user = uuidv4();
		session.save(/*catch error*/);
		user = await UserModel.create({ userId: session.user });
		console.log("welcome new joiner", session.user);
	}

	// send restaurant options when customer opens app
	const options = [
		"Select 1 to Place an order",
		"Select 99 to checkout order",
		"Select 98 to see order history",
		"Select 97 to see current order",
		"Select 0 to cancel order"
	]
	socket.emit("chatOpens", options);

	// listen for and handle user's response
	socket.on("userResponse", async (response) => {
		let option = parseInt(response.option);
		switch (true) {
			case option === 1:
				socket.emit("menuItems", menuItems)
				break;
			case option === 99:
				if (session.currentOrder) {
					await OrderModel.create(session.currentOrder);
					socket.emit("message", "Order placed!");
					session.currentOrder = undefined;
				} else {
					socket.emit("message", "No order to place! Please select 1 to view menu items.");
				}
				break;
			case option === 98:
				let orders = await OrderModel.find({ userId: user.userId })
				if (orders.length) {
					socket.emit("orderHistory", orders);
				} else {
					socket.emit("message", "No order history found. Please select 1 to view menu items.");
				}
				break;
			case option === 97:
				if (session.currentOrder) {
					socket.emit("currentOrder", session.currentOrder);
				} else {
					socket.emit("message", "You have no current order. Please select 1 to view menu items.");
				}
				break;
			case option === 0:
				if (session.currentOrder) {
					session.currentOrder = undefined;
					socket.emit("message", "Successfully cancelled current order. Please select 1 to view menu items.");
				} else {
					socket.emit("message", "You have no current order. Please select 1 to view menu items.");
				}
				break;
			case [11, 12, 13, 14, 15].includes(option):
				if (!session.currentOrder) {
					const currentOrder = {
						userId: user.userId,
						items: menuItems.filter((item) => item.itemId === option),
						totalPrice: menuItems.find((item) => item.itemId === option).price
					};
					socket.emit("currentOrder", currentOrder);
					session.currentOrder = currentOrder;
					session.save(/*catch error*/);
				} else {
					socket.emit("message", "You have an existing order. Please checkout or cancel.");
				}
				break;
			default:
				socket.emit("message", "Invalid option(s) received. Please check the available options below.");
				socket.emit("chatOpens", options);
				break;
		}
	})
})
