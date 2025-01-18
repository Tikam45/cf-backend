
const crypto = require("crypto");
const { cancelCancelDeal } = require("./Deal");
const Payment = require("../models/Payments")
const Razorpay = require("razorpay")

exports.creatPaymenteOrder = async(req, res) => {
    try{
        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_API_KEY,
            key_secret: process.env.RAZORPAY_APT_SECRET,
        });
        const {amount} = req.body;
        const options = {
            amount : amount*100,
            currency: "INR",
        }

        const order = await instance.orders.create(options);

        return res.status(200).json({
            success: true,
            message: "Payment Order Create Successfully",
            order,
        });
    }
    catch(error){
        res.status(500).json({
            success: false,
            message: "Couldn't create Payment Order Now"
        })
    }
}


exports.PaymentVerification = async(req, res) => {
    try{
        const {razorpay_order_id, razorpay_payment_id, razorpay_signature} = req.body;
        const {dealId} = req.query;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_APT_SECRET)
        .update(body.toString())
        .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if(isAuthentic){
            const payment = await Payment.create({
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
            })
            await cancelCancelDeal({dealId, PaymentId: payment});
        }
        else{
            res.status(401).json({
                success: false,
                message: "UnSuccessful Payment"
            })
        }
        res.status(200).json({
            success: true,
            message: "Payment Recieved and Deal Completed",
        })
    }
    catch(error){
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}