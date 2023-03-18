const express = require('express');

const app = express();
app.set("view engine", "ejs");
app.set("views", "views");

const PORT = 5000;

// Middlewares
app.use(express.urlencoded({ extended: false }))
app.use(express.json());

app.get("/", (req, res) => {
	res.render("index");
})

app.get("/test", (req, res) => {
	res.render("test");
})

app.listen(PORT, () => {
	console.log(`Server started successfully at http://localhost:${PORT}`)
})