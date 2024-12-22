
const User = require("../models/User");
const Bid = require("../models/Bids");
const Order = require("../models/Order");
const Deal = require("../models/Deal");

exports.createDeal = async(req, res) => {
    try {
        const {bidId} = req.body;
        const email = req.user.email;
        const bid = await Bid.findById(bidId);
        console.log("hello");
        const order = await Order.findById(bid.order).populate("user");
        if(order.user.email !== email){
            return res.status(401).json({
                success: false,
                message: "You are not authorised to accept bid",
            })
        }
        console.log("hello");
        if(!order.isActive){
            return res.status(401).json({
                success: false,
                message: "This Order is not accepting deals currently",
            })
        }
        console.log("hello");
        const deal = await Deal.create({
            order: order,
            seller: order.user,
            buyer: bid.bidder,
            description: bid.description,
            price: bid.price,
        })
        console.log("hello");
        order.isActive = false;
        order.deal = deal._id;
        await order.save();
        console.log("hello ji");
        const bidsIdArray = order.bids;

        await Bid.updateMany(
            { _id: { $in: bidsIdArray } },
            { $set: { isActive: false } }  
        );
        console.log("hello");
        const bidder = await User.findByIdAndUpdate(bid.bidder, 
            {
                $push: {deals: deal._id},
                $pull: {bids: bid._id}

            },
            {new: true, runValidators: true}
        )
        console.log("hello");
        const seller = await User.findByIdAndUpdate(order.user, 
            {
                $push: {deals: deal._id},
                $pull: {orders: order._id},
            },
            {new: true, runValidators: true},
        )
        console.log("hello");

        // console.log("buyer", buyer, seller);

        return res.status(200).json({
            success: true,
            message: "Deal Created Successfully",
            // seller,
        })
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        })
    }
}