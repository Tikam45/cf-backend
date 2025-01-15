
const User = require("../models/User");
const Bid = require("../models/Bids");
const Order = require("../models/Order");
const Deal = require("../models/Deal");
const { Queue, Worker } = require('@bullmq');
const mongoose = require('mongoose')

const cancelDealQueue = new Queue('cancelDealQueue', {
  connection: {
    host: process.env.REDIS_HOST,
    port: 6379,
    password: process.env.REDIS_PASSWORD,
    tls: { rejectUnauthorized: false },
  },
});

const cancelDealWorker = new Worker(
  'cancelDealQueue',
  async (job) => {
    const { dealId } = job.data;
    console.log("Processing cancellation job for deal:", dealId);
    await cancelDeal({ dealId });
  },
  {
    connection: {
      host: process.env.REDIS_HOST,
      port: 6379,
      password: process.env.REDIS_PASSWORD,
      tls: { rejectUnauthorized: false },
    },
  }
);

cancelDealWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed.`);
});

cancelDealWorker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});

exports.createDeal = async(req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
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
            ongoing: true,
            isConfirmed: false,
            isCompleted: false,
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

        const job = await cancelDealQueue.add({ dealId: deal._id }, { delay:  5*60 * 1000 });
        console.log("job", job);
        deal.cancellationJobId = job.id;
        await deal.save();

        const bidder = await User.findByIdAndUpdate(bid.bidder, 
            {
                $push: {deals: deal._id},
                $pull: {bids: bid._id}

            },
            {new: true, runValidators: true}
        )
        console.log("hello bidder", bidder);
        const seller = await User.findByIdAndUpdate(order.user, 
            {
                $push: {deals: deal._id},
                $pull: {orders: order._id},
            },
            {new: true, runValidators: true},
        )
        console.log("hello seller", seller);

        // console.log("buyer", buyer, seller);
        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            success: true,
            message: "Deal Created Successfully",
            // seller,
        })
    }
    catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        })
    }
}

const cancelDeal = async({dealId}) => {
    try {
        console.log("in cancel deal", dealId);
        const deal = await Deal.findById(dealId);
        const order = await Order.findByIdAndUpdate(deal.order, 
            {
                isActive :true,
            }
        );
        const bidsIdArray = order.bids;
        await Bid.updateMany(
            { _id: { $in: bidsIdArray } },
            { $set: { isActive: true } }  
        );
        const buyer = await User.findByIdAndUpdate(deal.buyer,{
            $pull: {deals: dealId}
        })
        const seller = await User.findByIdAndUpdate(deal.seller,{
            $pull: {deals: dealId}
        });
        const deletedDeal = await Deal.findByIdAndDelete(dealId);
        console.log("Deal Cancelled Successfully");
    } 
    catch (error) {
        console.log("Error in cancelling the deal" , error);
    }
}

exports.cancelCancelDeal = async (req, res) => {
    try {
        const { dealId } = req.body;

        const deal = await Deal.findById(dealId);
        if (!deal) {
            return res.status(404).json({ success: false, message: "Deal not found" });
        }

        if (!deal.cancellationJobId) {
            return res.status(400).json({ success: false, message: "No cancellation job scheduled for this deal" });
        }

        const job = await cancelDealQueue.getJob(deal.cancellationJobId);
        if (job) {
            await job.remove(); 
            deal.cancellationJobId = null; 
            deal.isConfirmed = true,
            deal.ongoing = false,
            await deal.save();

            return res.status(200).json({ success: true, message: "Deal cancellation operation successfully canceled" });
        } else {
            return res.status(404).json({ success: false, message: "Cancellation job not found" });
        }
    } catch (error) {
        console.error("Error canceling cancellation operation:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};