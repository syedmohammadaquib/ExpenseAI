const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../model/userModel");
require("dotenv").config();

const userRouter = express.Router();

// Password validation regex (At least 8 characters, 1 uppercase, 1 lowercase, 1 digit, 1 special character)
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;


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

userRouter.post("/login",async(req,res)=>{
    const {email,password} = req.body
    try {
            const user = await userModel.findOne({email})
            console.log(user);
            if(user){
                bcrypt.compare(password, user.password, function(err, result) {
                    if(result){
                        var token = jwt.sign({ name: user.name },process.env.JWTKEY)
                          if(token){
                            res.status(200).send({"msg":"user LoggedIn Successfully" , "Token" : token})
                          }else{
                            res.status(400).send({"msg":"Wrong Credentials"})
                          }
                    }else {
                        res.status(400).send({"msg":"Wrong Credentials"})
                    }
                });
            }else{
                res.status(400).send({"msg":"!User Not Found, Please register yourself"})
            }
         
    } catch (error) {
        res.status(400).send({"msg":error})
    }
    })

    



module.exports = userRouter