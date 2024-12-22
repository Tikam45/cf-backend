
const Order = require("../models/Order");
const Bids = require("../models/Bids");
const User = require("../models/User");

exports.createBid = async(request, response) => {
    console.log("aur bhai");
    const { price, orderId, description} = request.body;
    const {email} = request.user;


    try {
        
        if(!email || !price || !orderId) {
            console.log("hd da");
            return response.status(401).json({
                success: false,
                message: "Can't create Bid",
            })
        }

        const user = await User.findOne({email}).populate("bids");
        if(!user){
            return response.status(404).json({
                success: false,
                message: "Register first to create Bid",
            })
        }

        const userBids = user.bids;
        console.log("userbids", orderId, userBids );
        for(let i in userBids){
            console.log("ha jii", userBids[i].order)
        }
        const hasBidded = userBids.find(bid => bid.order.toString() === orderId);
        console.log(" has bidded", hasBidded);
        if(hasBidded){
            console.log(" has bidded", hasBidded);
            return response.status(401).json({
                success: false,
                message: "You can have one bid per order",
            })
        }

        const order = await Order.findById(orderId).populate("user");
        if(!order || !order.isActive){
            return response.status(404).json({
                success: false,
                message: "No such order is available currently",
            })
        }

        // if(!user.mobileNo){
        //     console.log("enter mob. no");
        //     return response.status(401).json({
        //         success: false,
        //         message: "Verify Mobile No. first before bidding",
        //     })
        // }

        if(order.user.email === email){
            console.log("order createor you are")
            return response.status(401).json({
                success: false,
                message: "Order creator can't be bidder",
            })
        }
        const bid = await Bids.create({
            order,
            bidder: user,
            description: description? description: "No other details",
            price,
        })
        order.bids.push(bid._id);
        await order.save();
        user.bids.push(bid._id);
        await user.save();
        order.bids = [];
        return response.status(200).json({
            success: true,
            message: "Bid is successfully added",
            // bid,
            order,
        })
    } 
    catch (error) {
        console.log(error);
        return response.status(500).json({
            success: false,
            message: "Internal Server Error",
        })
    }
}


exports.removeBid = async(request, response) => {
    try{
        const { bid} = request.body;

        if(!bid ){
            return response.status(401).json({
                success: false,
                message: "Couldn't delete bid",
            })
        }

        const dbbid = await Bids.findByIdAndDelete(bid);

        if(!dbbid){
            return response.status(404).json({
                success: false,
                message: "Bid is not found in db",
            })
        }

        return response.status(200).json({
            success: true,
            message: "Bid deleted Successfully",
        })
    }
    catch(error){
        return response.status(500).json({
            success: false,
            message: "Interanl Server Error",
        })
    }
}

exports.getUserBids = async(request, response) => {
    try {
        const email = request.user.email;
        const user = await User.findOne({email}).populate("bids")
        console.log("hello");
        return response.status(200).json({
            success: true,
            message: "Bids Fetched Successfully",
            bids: user.bids,
        })
    } 
    catch (error) {
        console.log(error);
        return response.status(500).json({
            success: false,
            message: "Internal Server Error",
            bids: [],
        })
    }
}