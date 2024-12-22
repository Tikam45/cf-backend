const jwt = require("jsonwebtoken");
require("dotenv").config();

// auth 
exports.auth = async(req, res, next) => {
    try{
        console.log("hi", req.body);
        const token =  req.query?.token ||
        req.body.token // GET request doesn't have body i.e. req.body has no meaning in express for GET request
        || req.cookie.token ||
        req.header("Authorization").replace("Bearer", "")
        console.log("Verifying token", token);

        if(!token){
            return res.status(401).json({
                success: false,
                message: "Token is missing",
            })
        }

        // verifying token
        // console.log("Verifying token", token);
        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            console.log(decode);
            req.user = decode;
        } 
        catch (error) {
            console.log(error);
            return res.status(401).json({
                success: false,
                message: "Token is invalid, Login again",
            })
        }
        console.log("hell do");
        next();
    }
    catch(error){
        console.log("hello" ,req.body, req.query);
        console.log(error);
        return res.status(401).json({
            success: false,
            message: "Something went wrong while validating token",
        })
    }
};
