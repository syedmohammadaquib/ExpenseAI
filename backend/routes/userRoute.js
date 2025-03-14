const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../model/userModel");
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