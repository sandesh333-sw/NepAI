import Thread from "../models/Thread.js";
import getOpenAPIResponse from "../utils/openai.js";

// Test endpoint to create a sample thread
export const testThread = async (req, res) => {
    try {
        const thread = new Thread({
            threadId: "xyz",
            title: "Testing new thread"
        });
        const response = await thread.save();
        res.send(response);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to create test thread" });
    }
};

// Get all threads for the authenticated user
export const getAllThreads = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        
        const threads = await Thread.find({ userId: req.user._id }).sort({ updatedAt: -1 });
        // descending order of updated at we need most recent data on top
        res.json(threads);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to fetch threads" });
    }
};

// Get a specific thread by threadId (only if it belongs to the user)
export const getThreadById = async (req, res) => {
    const { threadId } = req.params;
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        
        const thread = await Thread.findOne({ threadId, userId: req.user._id });
        if (!thread) {
            return res.status(404).json({ error: "Thread is not found" });
        }
        res.json(thread.messages);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to fetch chat" });
    }
};

// Delete a thread by threadId (only if it belongs to the user)
export const deleteThread = async (req, res) => {
    const { threadId } = req.params;
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        
        const deletedThread = await Thread.findOneAndDelete({ threadId, userId: req.user._id });

        if (!deletedThread) {
            return res.status(404).json({ error: "Thread not found" });
        }
        res.status(200).json({ success: "Thread deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to delete thread" });
    }
};

// Handle chat messages
export const chat = async (req, res) => {
    const { threadId, message } = req.body;

    if (!req.user || !req.user._id) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    if (!threadId || !message) {
        return res.status(400).json({ error: "missing required fields" });
    }

    try {
        let thread = await Thread.findOne({ threadId, userId: req.user._id });

        if (!thread) {
            // creating a new thread in db with userId
            thread = new Thread({
                threadId,
                userId: req.user._id,
                title: message,
                messages: [{ role: "user", content: message }]
            });
        } else {
            // Verify thread belongs to user (extra security check)
            if (thread.userId.toString() !== req.user._id.toString()) {
                return res.status(403).json({ error: "Access denied" });
            }
            thread.messages.push({ role: "user", content: message });
        }

        const reply = await getOpenAPIResponse(message);

        thread.messages.push({ role: "assistant", content: reply });
        thread.updatedAt = new Date();

        await thread.save();
        res.json({ reply: reply });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "something went wrong" });
    }
};

