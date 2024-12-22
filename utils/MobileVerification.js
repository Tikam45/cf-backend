
const twilio = require('twilio');
require("dotenv").config();

// Twilio credentials
const accountSid = process.env.TWILIO_SID; 
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Initialize Twilio client
const client = twilio(accountSid, authToken);


// Send OTP via SMS using Twilio
const messageSender = async({otp, mobile}) =>{
  console.log("in message" , otp ,mobile);
  try{
    // if (!mobile.startsWith("+91")) {
    //   if (mobile.length === 10 && /^[0-9]{10}$/.test(mobile)) {
    //     mobile = `+91${mobile}`;
    //   } else {
    //     throw new Error("Invalid Indian phone number. Must be 10 digits or in +91 format.");
    //   }
    // }
    client.messages.create({
      body: `Your OTP for Contract Farming Website is ${otp}`,
      from: twilioPhoneNumber,
      to: `+91${mobile}`,
    })
    .then((message) => {
      console.log(message.sid);
      return message;
    })
  }
  catch(error){
    console.error(error);
    throw error;
  }
}

module.exports = messageSender;