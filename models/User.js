const mongoose = require("mongoose");
const Order = require("./Order");
const Bid = require("./Bids")
const Deal = require("./Deal");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    // middleName: {
    //     type: String,
    //     required: false,
    //     trim : true,
    // },
    lastName: {
        type: String,
        required: true,
        trim: true,
    },
    email:{
        type: String,
        required: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    mobileNo : {
        type: Number,
        trim: true,
    },
    image: {
        type: String,
        required: true,
    },
    aadhar: {
        type: Number,
        // required: true,
    },
    orders: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "Order"
        }
    ],
    bids:[
        {
            type: mongoose.Schema.ObjectId,
            ref: "Bid",
        }
    ],
    deals:[
        {
            type: mongoose.Schema.ObjectId,
            ref: "Deal"
        }
    ]
});

module.exports = mongoose.model("User", userSchema);