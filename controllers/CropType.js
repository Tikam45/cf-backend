
const CropType = require("../models/CropTypes");

exports.getCropTypes = async(req, res) => {
    try{
        const cropTypes = await CropType.find({});
        console.log(cropTypes);
        return res.status(200).json({
            success: true,
            message: "Crop Types Found",
            cropTypes
        })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            cropTypes: []
        })
    }
}

exports.addCropTypes = async(req, res) => {
    try{
        const {crop} = req.body;
        const addedCrop = await CropType.create({
            crop: crop
        })
        return res.status(200).json({
            success: true,
            message: "Crop Type Added Successfully",
            addedCrop,
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