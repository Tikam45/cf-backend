
const mongoose = require("mongoose");
const User = require("./User");
const Deal = require("./Deal");
const Bid = require("./Bids");

const orderSchema = new mongoose.Schema({
    crop:{
        type: String,
        required: true,
        trim: true,
    },
    area: {
        type: Number,
        required: true,
        trim: true,
    },
    coverPhoto:{
        type: String,
        required: true,
        trim: true,
    },
    firstPic:{
        type: String,
        trim: true,
    },
    secondPic:{
        type: String,
        trim: true,
    },
    thirdPic:{
        type: String,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
        trim: true,
    },
    landDocument: {
        type: String,
        required: true,
        trim: true,
    },
    isActive:{
        type: Boolean,
        required: true,
    },
    user:{
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: "User",
    },
    bids: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "Bid",
        }
    ],
    deal: {
        type: mongoose.Schema.ObjectId,
        ref: "Deal",
    }
})

module.exports = mongoose.model("Order", orderSchema);