
const User = require("../models/User");
const MobOtp = require("../models/MobileOtp");
const otpGenerator = require("otp-generator");
const uploadPhoto = require("../utils/Cloudinary");

// send OTP message
exports.sendOtpMessage = async(req, res) => {
    try {
        const {mobile} = req.body;

        if(req.user.mobileNo){
            return res.status(401).json({
                success: false,
                message: "Your Mobile No. is already registered",
            })
        }

        let otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });

        const otpBody = await MobOtp.create({
            mobile: mobile,
            otp: otp,
        });

        console.log(otpBody);
        res.status(200).json({
            success: true,
            message: "OTP sent successfully via message",
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}


// update Mobile No.
exports.updateMobile = async(req, res) => {
    try {
        const {mobile, otp} = req.body;
        
        const recentOtp = await MobOtp.find({mobile: mobile})
        .sort({createdAt: -1})
        .limit(1);

        if(recentOtp.length == 0){
            return res.status(400).json({
                success: "false",
                message: "Error while matching OTP",
            });
        }
        else if(otp != recentOtp[0].otp){
            return res.status(400).json({
                success: false,
                message: "OTP is not matching"
            })
        }

        const email = req.user.email;
        const user = await User.findOne({email});
        if(user.mobileNo){
            return res.status(401).json({
                success: false,
                message: "You have already a registered Mobile No."
            })
        }

        const mobUser = await User.findOne({mobileNo : mobile});
        if(mobUser){
            return res.status(401).json({
                success: false,
                message: "This Mobile No. is already registered",
            })
        }
        user.mobileNo = mobile;
        await user.save();

        user.password = null;
        return res.status(200).json({
            success: true,
            message: "Mobile No. added Successfully",
            user,
        });
    } 
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        })
    }
}


// update image
exports.updateImage = async(req, res) => {
    try{
        const profilePic = req.file;
        console.log(" image updation");
        const email = req.user.email;
        console.log(email, profilePic, req.files, req.file);
        const user = await User.findOne({email: email});
        if(!user){
            return res.status(404).json({
                success:false,
                message: "User doesn't exist",
            })
        }

        const profilePicUrl = await uploadPhoto(profilePic.path, "users");
        console.log(user);
        user.image = profilePicUrl.url;
        await user.save();

        user.password = null;
        return res.status(200).json({
            success: true,
            message: "Image Update Successfully",
            user,
        })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        })
    }
}


// get user Profile
exports.getUserProfile = async(req, res) => {
    console.log("h i");
    const {email} = req.user;

    const user = await User.findOne({email});
    if(!user){
        return res.status(404).json({
            success: false,
            message: "Error While Fethcing Details",
            user: {},
        })
    }
    user.password = null
    return res.status(200).json({
        success: true,
        message: "Details Fetched Successfully",
        user,
    })
}