import express from "express";
import {
    testThread,
    getAllThreads,
    getThreadById,
    deleteThread,
    chat
} from "../controllers/chatController.js";

const router = express.Router();

// Test route
router.post("/test", testThread);

// Thread routes
router.get("/thread", getAllThreads);
router.get("/thread/:threadId", getThreadById);
router.delete("/thread/:threadId", deleteThread);

// Chat route
router.post("/chat", chat);

export default router;
