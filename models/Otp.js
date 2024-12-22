
const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");

const otpSchema = new mongoose.Schema({
    email:{
        type: String,
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

async function sendVerificationEmail(email, otp){
    try {
        const mailResponse = await mailSender(
            email,
            "Verification mail from farm Place",
            otp
        );
        console.log("Otp sent successfully", mailResponse);
    } 
    catch (error) {
        console.log("Error while sending otp: ", error);
        throw error;
    }
}

otpSchema.pre("save", async function (next) {
    await sendVerificationEmail(this.email, this.otp);
});

module.exports = mongoose.model("OTP", otpSchema);