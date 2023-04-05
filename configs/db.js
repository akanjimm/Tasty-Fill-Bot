const mongoose = require('mongoose');
const { MONGO_DB_CONNECTION_URL } = require('../configs/config');

// Make connection to the database
function connectToMongoDb() {
    mongoose.connect(MONGO_DB_CONNECTION_URL);

    mongoose.connection.on("connected", () => {
        console.log("Successfully connected to MongoDB");
    });

    mongoose.connection.on("error", (err) => {
        console.log("Error connecting to the database!");
        console.log(err);
    });
}

module.exports = { connectToMongoDb }