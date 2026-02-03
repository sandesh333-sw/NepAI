import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ["user", "assistant"],
        required: true
    },
    content: {
        type: String,
        required: true
    }
},{
    timestamps: true // Auto-adds createdAt and updatedAt
});

const ThreadSchema = new mongoose.Schema({
    userId:{
        type: String,
        required: true,
        index: true // For fast lookups
    },
    title: {
        type: String,
        default: "New Chat",
        maxLength: 100
    },
    messages: [MessageSchema]
}, {
    timestamps: true
});

// Compound index for efficient queries
ThreadSchema.index({userId: 1, createdAt: -1});

export default mongoose.models.Thread || mongoose.model("Thread", ThreadSchema);