
const mongoose = require("mongoose");
const messageSender = require("../utils/MobileVerification")

const mobileOtpSchema = new mongoose.Schema({
    mobile:{
        type: Number,
        required: true,
        trim: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: 5*60,
    },
});

async function sendVerificationMessage(mobile , otp){
    try {
        console.log("saving", mobile, otp);
        const messageResponse = await messageSender({otp, mobile});
        console.log("Message Sent Successfully", messageResponse);
    }
    catch (error) {
        console.log("Error while sending message: ", error);
        throw error;
    }
};

mobileOtpSchema.pre("save", async function(next){
    console.log("haaha", this.mobile, this.otp);
    await sendVerificationMessage(this.mobile, this.otp);
});

module.exports = mongoose.model("MobOtp", mobileOtpSchema);


// The issue lies in the use of the this keyword in the pre middleware of Mongoose. In Mongoose's pre-save hooks, this refers to the document being saved. However, when using arrow functions (() => {}), this does not behave as expected because arrow functions do not bind their own this; instead, they inherit it from the surrounding scope.

// To fix this, use a regular function instead of an arrow function for the pre middleware. This ensures this correctly refers to the document being saved.

