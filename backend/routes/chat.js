import express from "express";
import Thread from "../models/Thread.js";
import getOpenAPIResponse from "../utils/openai.js";

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

//Get all threads
router.get("/thread", async(req, res) => {
    try {
       const threads =  await Thread.find({}).sort({updatedAt: -1});

       //descending order of updated at we need most recent data on top
       res.json(threads);

    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Failed to fetch threads"});
    }
});

router.get("/thread/:threadId", async(req, res) => {
    const { threadId } = req.params;
    try {
        const thread = await Thread.findOne({threadId});
        if(!thread){
            res.status(404).json({error: "Thread is not found"});
        }
        res.json(thread.messages);
    } catch (error) {
        console.log(err);
        res.status(500).json({error: "Failed to fetch chat"});
    }
})

router.delete("/thread/:threadId", async(req, res) => {
    const { threadId } = req.params;
    try {
      const deletedThread =   await Thread.findOneAndDelete({threadId});

      if(!deletedThread){
        res.status(404).json({error: "Thread not found"});
      }
      res.status(200).json({success: "Thread deleted successfully"});

    } catch (error) {
        console.log(err);
        res.status(500).json({error: "Failed to delete thread"});
    }
});


router.post("/chat", async(req, res) => {
    const {threadId, message} = req.body;

    if(!threadId || !message){
        res.status(400).json({error: "missing required fields"});
    }

    try {
        let thread = await Thread.findOne({threadId});

        if(!thread){
            //creating a new thread in db
            thread = new Thread({
                threadId,
                title: message,
                messages: [{role: "user", content: message}]
            });

        } else {
            thread.messages.push({role:"user", content: message});
        }

        const reply = await getOpenAPIResponse(message);

        thread.messages.push({role: "assistant", content: reply});
        thread.updatedAt = new Date();

        await thread.save();
        res.json({reply: reply});

    } catch (error) {
        console.log(error);
        res.status(500).json({error:"something went wrong" });
    }
});

export default router;