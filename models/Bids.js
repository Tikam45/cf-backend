
const mongoose = require("mongoose");
const Order = require("./Order");
const User = require("./User");

const bidSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: "Order",
    },
    bidder: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: "User",
    },
    description: {
        type: String,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
    },
    isAccepted:{
        type: Boolean,
        required: true,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    }

});

module.exports = mongoose.model("Bid", bidSchema);