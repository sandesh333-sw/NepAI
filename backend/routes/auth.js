import express from "express";
import passport from "passport";
import { register, login, logout, getMe } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", getMe);

// Google OAuth Routes
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { 
    failureRedirect: process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/login` : "http://localhost:5173/login"
  }),
  (req, res) => {
    // Successful authentication, redirect home.
    // In production, redirect to your frontend URL
    res.redirect(process.env.FRONTEND_URL || "http://localhost:5173");
  }
);

export default router;