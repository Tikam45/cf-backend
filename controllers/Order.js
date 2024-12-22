
const Order = require("../models/Order");
const User = require("../models/User");
const jwt = require("jsonwebtoken")
const uploadPhoto = require("../utils/Cloudinary");
const Bids = require("../models/Bids");
// const multer = require("multer");
// const upload = multer({ dest: "uploads/" });

// create order 
exports.createOrder = async(request, response) => {
    console.log(request.body);
    const { crop, area, price } = request.body;
    const email = request.user.email;
    const { coverPhoto, firstPic, secondPic, thirdPic, landDocument } = request.files;
    if(!crop || !area || !coverPhoto || !price || !landDocument || !email){
        // console.log("hi");
        return response.status(400).json({
            success: false,
            message: "Complete all the fields",
        })
    }

    try {
        const user = await User.findOne({email});
        if(!user){
            return response.status(404).json({
                success: false,
                message: "Register First to create Order",
            });
        }

        // if(!user.aadhar){
        //     return response.status(401).json({
        //         success: false,
        //         message: "Verify aadhar first to create Order",
        //     })
        // }

        if(!user.mobileNo){
            return response.status(401).json({
                success: false,
                message: "Verify your mobile no. first",
            })
        }

        let landDocumentUrl = "";
        const picsArray = [];
        try{
            // console.log("ji" , coverPhoto);
            const coverPhotoUrl = await uploadPhoto(coverPhoto[0].path, "land");
            picsArray.push(coverPhotoUrl);

            landDocumentUrl = await uploadPhoto(landDocument[0].path, "documents");

            if(firstPic){
                const picUrl = await uploadPhoto(firstPic[0].path, "land");
                picsArray.push(picUrl);
            }
            if(secondPic){
                const picUrl = await uploadPhoto(secondPic[0].path, "land");
                picsArray.push(picUrl);
            }
            if(thirdPic){
                const picUrl = await uploadPhoto(thirdPic[0].path, "land");
                picsArray.push(picUrl);
            }
        }
        catch(error){
            console.log("ha ji");
            console.log(error);
            return response.status(401).json({
                success: false,
                message: "Photos couldn't be uploaded"
            })
        }
        console.log(user._id);
        const order = await Order.create({
            crop,
            area,
            coverPhoto: picsArray[0].url,
            firstPic: picsArray.length >1 ? (picsArray[1].url) : null,
            secondPic: picsArray.length >2 ? (picsArray[2].url) : null,
            thirdPic: picsArray.length > 3 ? (picsArray[3].url) : null,
            price,
            landDocument: landDocumentUrl.url,
            isActive: true,
            user: user._id,
            bids: [],
        });

        user.orders.push(order._id);
        await user.save();
        
        return response.status(200).json({
            success: true,
            message: "Order created successfully",
        })
    } 
    catch (error) {
        console.log(error);
        return response.status(500).json({
            success: false,
            message: "Order can't be created"
        })
    }
};


// get Orders
exports.getOrders = async(request, response) => {
    try{
        const orders = await Order.find({isActive: true});

        orders.forEach((order) => {
            order.bids = [];
            order.user = null;
        })
        
        return response.status(200).json({
            success: true,
            message: "Orders fetched Successfully",
            orders,
        });
    }
    catch(error){
        return response.status(500).json({
            success: false,
            message: "Internal Server Error",
        })
    }
}


// remove order
exports.removeOrder = async(request, response) => {
    const { orderId} = request.body;
    const {email} = request.user;
    console.log("hdas");
    try{
        const order = await Order.findById(orderId).populate("user");
        console.log("hi" ,order);
        if(!order){
            return response.status(401).json({
                success: false,
                message: "No such order available",
            })
        }

        const user = order.user;
        // user.populate("email");
        console.log("user", user);
        if(user.email != email){
            console.log(user.email, email);
            return response.status(401).json({
                success: "false",
                message: "You can't remove this order",
            })
        }

        const orderIndex = user.orders.indexOf(orderId);
        if (orderIndex === -1) {
            console.log("true", "dhfd fdf")
            return response.status(404).json({
                success: false,
                message: "Order not found in user's orders",
            });
        }

        // Modify the orders array in memory
        user.orders.splice(orderIndex, 1); // Removes the order by index

        // Save the updated document back to the database
        await user.save();

        await Bids.deleteMany({order: orderId});

        const deletedOrder = await Order.findByIdAndDelete(orderId);

        return response.status(200).json({
            success: true,
            message: "Order removed Successfully",
        })

    }
    catch(error){
        console.log(error);
        return response.status(500).json({
            success: false,
            message: "Internal Server error while removing order",
        })
    }
}

// get User Orders
exports.getUserOrdersBidsAndDeals = async(request, response) =>{
    try {
        const email = request.user.email;
        const user = await User.findOne({ email: email })
        .populate({
            path: "orders",
            populate: {
                path: "bids", // Populate bids within orders
                model: "Bid", // Specify the model explicitly if needed
            },
        })
        .populate({
            path: "deals",
            populate: [
                { path: "seller" },  // Populate the seller in deals
                { path: "buyer" },   // Populate the buyer in deals
                { path: "order" },   // Populate the order in deals
            ],
        })
        .populate({
            path: "bids",
            populate: [
                { path: "order" },   // Populate the related order in bids
                // { path: "bidder" },  // Populate the bidder in bids
            ],
        })
        

        console.log(user);
        // user.deals.buyer.password = null;
        // user.deals.seller.password = null;

        user.deals.forEach((deal) => {
            deal.seller.password = null;
            deal.seller.deals = [];
            deal.seller.bids = [];
            deal.seller.orders = [];

            deal.buyer.password = null;
            deal.buyer.deals = [];
            deal.buyer.bids = [];
            deal.buyer.orders = [];
        })

        return response.status(200).json({
            success: true,
            message:"Orders fetched Successfully",
            orders: user.orders,
            bids: user.bids,
            deals: user.deals,
        })
    }
    catch (error) {
        console.log("hi");
        console.log(error);
        // console.log(request.body);
        return response.status(500).json({
            success: false,
            message: "Internal Server Error",

        });
    }
}


// get Order Details
exports.getOrderDetails = async(req, res) => {
    try {
        const {orderId} = req.params;
        console.log("ha ji", req.params);
        if(!orderId) {
            return res.status(404).json({
                success: false,
                message: "No order found",
            })
        }
        const order = await Order.findById(orderId);
        if(!order){
            console.log("order", order);
            return res.status(404).json({
                success: false,
                message: "No such Order found",
            })
        }
        // if(!order.user.email !== req.user.email){
        //     return res.status(401).json({
        //         success: false,
        //         message: "You are not authorized for this detail",
        //     })
        // }

        order.deal = null;
        order.bids = [];
        
        
        return res.status(200).json({
            success: true,
            message: "Order details found ",
            data: order,
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