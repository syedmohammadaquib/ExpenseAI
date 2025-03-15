const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    mobile: { type: String, unique: true, sparse: true }, // Optional for email-only users
    email: { type: String, unique: true, sparse: true }, // Optional for mobile-only users
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
},{timestamps:true})


// Ensure at least one of mobile or email is provided
userSchema.pre("save", function (next) {
    if (!this.mobile && !this.email) {
        return next(new Error("Either mobile or email must be provided."));
    }
    next();
});


const userModel = mongoose.model("user",userSchema);

module.exports= userModel;