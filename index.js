
const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const Razorpay = require("razorpay")

require("dotenv").config();
const PORT = process.env.PORT || 4000;

const cookieParser = require("cookie-parser");
app.use(cookieParser());

app.use(express.json());

app.use(express.urlencoded({extended: false}));


app.use(cors({
    origin: 'https://cf-frontend-sigma.vercel.app'
}));


require("./config/database").connect();

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

export const instance = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_APT_SECRET,
});

const routes = require("./routes/route");
app.use("", routes);

app.listen(PORT, () =>{
    console.log(`App is listening at ${PORT}`)
});

