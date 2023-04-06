const mongoose = require('mongoose');

// Define a schema
const Schema = mongoose.Schema;

// Define Menu Schema
const MenuSchema = new Schema({
    itemId: String,
    itemName: String,
    price: Number
});

// Define Order Schema
const OrderSchema = new Schema({
    userId: String,
    items: {
        type: [MenuSchema],
        default: undefined
    },
    totalPrice: Number
}, { timestamps: true });

const OrderModel = mongoose.model('Order', OrderSchema);

module.exports = OrderModel;