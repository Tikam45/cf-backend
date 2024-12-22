
const express = require("express");
const router = express.Router();
const {login, signUp, sendOTP} = require("../controllers/Auth");
const {createOrder, getOrders, removeOrder, getUserOrdersBidsAndDeals, getOrderDetails} = require("../controllers/Order");
const {createBid, removeBid, getUserBids} = require("../controllers/Bid");
const {sendOtpMessage,updateImage, updateMobile, getUserProfile} = require("../controllers/Profile")
const {auth} = require("../middlewares/Auth")
const upload = require("../middlewares/Multer");
const {createDeal} = require("../controllers/Deal")


router.post("/auth/login", login);
router.post("/auth/signup", signUp);
router.post("/auth/sendotp", sendOTP);

router.post("/orders/createOrder",auth, upload.fields([
    { name: "coverPhoto", maxCount: 1 }, // 1 file for coverPhoto
    { name: "landDocument", maxCount: 1 }, // 1 file for landDocument
    {name: "firstPic", maxCount: 1},
    {name: "secondPic", maxCount: 1},
    {name: "thirdPic", maxCount: 1},
  ]), async(req, res, next ) => {
    console.log(" hell l", req.files);
    next();
},createOrder);

router.get("/orders/getLiveOrders", getOrders);
router.delete("/orders/removeOrder", auth, removeOrder);
router.get("/orders/getUserDashboard", auth, getUserOrdersBidsAndDeals);
router.get("/order/orderDetails/:orderId", getOrderDetails);

router.get("/profile/getUserDetails", auth, getUserProfile);
router.post("/profile/sendOtpMessage", auth, sendOtpMessage);
router.put("/profile/updateMobile", auth, updateMobile);
router.put("/profile/updateImage", auth, upload.single("profilePic"), async(req, res, next) => {
    console.log(" ha aa gayi" , req.file);
    next();
  } ,updateImage);

router.post("/bids/createBid", auth, createBid);
router.delete("/bids/deleteBid",auth, removeBid);
// router.get("/bids/getUserBids", auth, getUserBids);

router.post("/deals/createDeal", auth, createDeal);

module.exports = router;
