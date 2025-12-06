import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String, //Not required for Google OAuth
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true,  //Allow null values
    },
    displayName:String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model("User", UserSchema);