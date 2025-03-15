const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../model/userModel");
const twilio = require("twilio");
const nodemailer = require("nodemailer");
const OTPModel = require("../model/otpModel");
require("dotenv").config();

const userRouter = express.Router();

// Password validation regex (At least 8 characters, 1 uppercase, 1 lowercase, 1 digit, 1 special character)
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Get request for all the existing users 

userRouter.get("/",async(req,res)=>{
    try {
        const users = await userModel.find({},"-password");
        res.status(200).json(users)
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Server Error", error: error.message });
    }
})




// Twilio Config (For SMS OTP)
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

// Nodemailer Config (For Email OTP)
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
});

// Generate & Send OTP

const otpExpiration = 5*60*1000 //5 min duration

userRouter.post("/send-otp", async (req, res) => {
    const { mobile} = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP

    try {
        // Save OTP in the database with expiration time
        await OTPModel.create({ mobile, otp, expiresAt: new Date(Date.now() + otpExpiration) });

        // Send OTP via SMS
        if (mobile) {
            await client.messages.create({
                body: `Your OTP is ${otp}. It expires in 5 minutes.`,
                from: process.env.TWILIO_PHONE,
                to: mobile
            });
            return res.json({ msg: "OTP sent via SMS" });
        }

        // Send OTP via Email
        // if (email) {
        //     await transporter.sendMail({
        //         from: process.env.EMAIL_USER,
        //         to: email,
        //         subject: "Your OTP Code",
        //         text: `Your OTP is ${otp}. It expires in 5 minutes.`
        //     });
        //     return res.json({ msg: "OTP sent via Email" });
        // }
        res.status(400).json({ msg: "Please provide a mobile number or email" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Failed to send OTP", error: error.message });
    }
});

userRouter.post("/verify-otp", async (req, res) => {
    const { mobile, email, otp, name, password } = req.body;

    try {
        // Find OTP in database
        const otpRecord = await OTPModel.findOne({ mobile, otp }) || await OTPModel.findOne({ email, otp });

        if (!otpRecord) {
            return res.status(400).json({ msg: "Invalid OTP" });
        }

        if (otpRecord.expiresAt < Date.now()) {
            return res.status(400).json({ msg: "OTP expired" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user in database
        const newUser = await userModel.create({
            name,
            mobile,
            email,
            password: hashedPassword
        });

        // Generate JWT Token
        const token = jwt.sign({ userId: newUser._id }, process.env.JWTKEY, { expiresIn: "1h" });

        // Delete OTP after successful verification
        await OTPModel.deleteOne({ _id: otpRecord._id });

        res.status(201).json({ msg: "Registration successful", token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Failed to verify OTP", error: error.message });
    }
});

//  Post request for register 

userRouter.post("/register",async(req,res)=>{
const {email,password,name} = req.body
try {

    // Check if the user already exists
    let existingUser = await userModel.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ msg: "User already exists" });
    }

     // Validate password strength
     if (!passwordRegex.test(password)) {
        return res.status(400).json({ 
            msg: "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)"
        });
    }
        // Hashing password
        const salt = await bcrypt.genSalt(10); // More secure salt rounds
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create and save user
        const newUser = new userModel({ email, password: hashedPassword, name });
        await newUser.save();

        res.status(201).json({ msg: `${name} is registered successfully` });

} catch (error) {
    res.status(400).send({"msg":error.message})
}
})

//Post request for login  

userRouter.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: "!User Not Found, Please register yourself" });
        }

        // Compare password with hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Incorrect Password" });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id, name: user.name }, process.env.JWTKEY, { expiresIn: "1h" });

        res.status(200).json({ msg: `${user.name} Logged in successfully`, token });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Server Error", error: error.message });
    }
});

    



module.exports = userRouter