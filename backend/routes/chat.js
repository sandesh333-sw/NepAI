import express from "express";
import Thread from "../models/Thread.js";

const router = express.Router();


router.post("/test", async(req, res) => {
    try {
        const thread = new Thread({
            threadId: "xyz",
            title: "Testing new thread"
        });
        const response = await thread.save();
        res.send(response);
    } catch (error) {
        console.log(error);
    }
});

export default router;