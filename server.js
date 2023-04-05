const path = require('path');
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const { connectToMongoDb } = require('./configs/db');

const { HOST, PORT } = require('./configs/config');
const config = require('./configs/config');

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

// connectToMongoDb();
httpServer.listen(PORT, () => {
	console.log(`Server started successfully at http://localhost:${PORT}`)
})

// socket session middleware
// convert a connect middleware to a Socket.IO middleware
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
io.use(wrap(session(sess)));


io.on("connection", async (socket) => {
	const session = socket.request.session;
	console.log("sessionid", session.id)
	if (session.user) {
		console.log("welcome back", session.user);
	} else {
		console.log("welcome new joiner", session.user);
		session.user = uuidv4();
		session.save(/*catch error*/)
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
})
