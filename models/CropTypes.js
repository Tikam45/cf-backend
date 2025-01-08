
const mongoose = require("mongoose");

const CropTypeSchema = new mongoose.Schema({
    crop:{
        type: String,
        required: true,
    }
});

module.exports = mongoose.model("CropType", CropTypeSchema);