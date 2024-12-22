const mongoose = require("mongoose");
require("dotenv").config();

exports.connect = () =>{
    mongoose
    .connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("DB is connected Successfully"))
    .catch((error) => {
        console.log("There is a issue during Database connection");
        console.log(error);
        console.log("Hello ji ", process.env.MONGODB_URL);
        process.exit(1);
    });
};