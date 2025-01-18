const mongoose = require("mongoose");
const User = require("./User");
const Payment = require("./Payments");

const dealSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.ObjectId,
        ref: "Order",
        required: true,
    },
    seller: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: "User",
    },
    buyer: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: "User",
    },
    price: {
        type: Number,
        trim: true,
        required: true,
    },
    description: {
        type: String,
        trim: true,
    },
    ongoing:{
        type: Boolean,
    },
    isConfirmed:{
        type: Boolean,
    },
    isCompleted:{
        type: Boolean,
    },
    cancellationJobId:{
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    paymentId:{
        type: mongoose.Schema.ObjectId,
        ref: "Payment"
    }
});

module.exports = mongoose.model("Deal", dealSchema);