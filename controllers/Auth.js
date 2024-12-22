
const User = require("../models/User");
const OTP = require("../models/Otp");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// auth send OTP
exports.sendOTP = async(request, response) => {
    // console.log("hello");
    try {
        const {email} = request.body;
        // console.log("hello");
        const checkUserPresent = await User.findOne({email});

        if(checkUserPresent){
            return response.status(201).json({
                success: false,
                message: "User is already registered",
            });
        }

        // generate otp
        // otp of 6 length with given options
        let otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });

        const otpPayload = {email, otp};

        // create the otp entry in db
        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody);

        response.status(200).json({
            success: true,
            message: "OTP sent successfully",
        });
    } 
    catch (error) {
        console.log("Error while sending otp", error);
        return response.status(500).json({
            success: false,
            message: error.message,
        })
    }
};

// Signup
exports.signUp = async(request, response) => {
    try{
        console.log("hi in signup");
        const {firstName, lastName, email, password, confirmPassword, otp} = request.body;
        if(!firstName || !lastName ||
        !email ||
        !password ||
        !confirmPassword ||
        !otp){
            return response.status(401).json({
                success: false,
                message: "All fields are compulsory",
            });
        }

        if(password !== confirmPassword){
            return response.status(400).json({
                success: false,
                message: "Password fields doesn't match",
            })
        }

        const ifUserexists = await User.findOne({email});
        if (ifUserexists) {
            return response.status(400).json({
              success: false,
              message: "User is already registered",
            });
        }

        const recentOtp = await OTP.find({email: email})
        .sort({createdAt: -1})
        .limit(1);

        if(recentOtp.length == 0){
            return response.status(400).json({
                success: "false",
                message: "Error while matching OTP",
            });
        }
        else if(otp != recentOtp[0].otp){
            return response.status(400).json({
                success: false,
                message: "OTP is not matching"
            })
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            firstName, 
            // middleName,
            lastName,
            email,
            password: hashedPassword,
            mobileNo: null,
            image: `https://api.dicebear.com/9.x/initials/svg?seed=${firstName}-${lastName}`,
            aadhar: null,
            orders : [],
            deals: [],
        });

        user.password = null;
        return response.status(200).json({
            success: true,
            message: "User is Registered successfully",
            user,
        });
    }
    catch(error){
        console.log(error);
        return response.status(500).json({
            success: false,
            message: "User could not be registered",
        });
    }
}


// Login
exports.login = async (request, response) => {
    try {
      const { email, password } = request.body;
  
      if (!email || !password) {
        return response.status(403).json({
          success: false,
          message: "All fields are compulsory",
        });
      }
  
      const existingUser = await User.findOne({ email: email });
      if (!existingUser) {
        return response.status(401).json({
          success: false,
          message: "User is not registered",
        });
      }
      if (await bcrypt.compare(password, existingUser.password)) {
        const payload = {
          email: existingUser.email,
          id: existingUser._id,
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: "2h",
        });
        existingUser.token = token;
        existingUser.password = undefined;
  
        const options = {
          expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          httpOnly: true,
        };
        response.cookie("token", token, options).status(200).json({
          success: true,
          token,
          existingUser,
          message: "Logged in Successfully",
        });
      } else {
        return response.status(401).json({
          success: false,
          message: "Password is incorrect",
        });
      }
    } catch (error) {
      console.log(error);
      return response.status(500).json({
        success: false,
        message: "Login Failed",
      });
    }
};
  