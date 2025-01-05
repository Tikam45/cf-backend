
const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");

const PassOtpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
    },
    otp:{
        type: String,
        required: true,
    },
    createdAt:{
        type: Date,
        default: Date.now(),
        expires: 5*60,
    }
})


async function sendVerificationEmail(email, otp){
    try {
        const mailResponse = await mailSender(
            email,
            "OTP to reset your password",
            otp
        );
        console.log("Otp sent successfully", mailResponse);
    } 
    catch (error) {
        console.log("Error while sending otp: ", error);
        throw error;
    }
}

PassOtpSchema.pre("save", async function (next) {
    await sendVerificationEmail(this.email, this.otp);
});

module.exports = mongoose.model("PassOtp", PassOtpSchema);