import express from "express";
import {
    testThread,
    getAllThreads,
    getThreadById,
    deleteThread,
    chat
} from "../controllers/chatController.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

// Test route (can be removed in production)
router.post("/test", testThread);

// All thread routes require authentication
router.get("/thread", isAuthenticated, getAllThreads);
router.get("/thread/:threadId", isAuthenticated, getThreadById);
router.delete("/thread/:threadId", isAuthenticated, deleteThread);

// Chat route requires authentication
router.post("/chat", isAuthenticated, chat);

export default router;
