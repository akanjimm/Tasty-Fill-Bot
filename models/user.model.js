const mongoose = require('mongoose');

// Define a schema
const Schema = mongoose.Schema;

// Define User Schema
const UserSchema = new Schema({
    userId: {
        type: String,
        required: [true, "This is required"],
        trim: true
    }
}, { timestamps: true });

const UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;