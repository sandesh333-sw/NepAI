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
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});


const ThreadSchema = new mongoose.Schema({
    threadId: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true // For faster queries
    },
    title: {
        type: String,
        default: "New Chat"
    },
    messages: [MessageSchema],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index: threadId should be unique per user, not globally
ThreadSchema.index({ threadId: 1, userId: 1 }, { unique: true });

export default mongoose.model("Thread", ThreadSchema);