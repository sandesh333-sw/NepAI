import bcrypt from "bcryptjs";
import passport from "passport";
import User from "../models/User.js";
import { sendWelcomeEmail } from "../utils/emailService.js";

export const register = async (req, res, next) => {
  try {
    const { email, password, displayName } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Check existing - normalize email to lowercase
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      // Check if user has password (email/password account) or only Google
      if (existingUser.password) {
        return res.status(400).json({ message: "An account with this email already exists. Please sign in instead." });
      } else {
        return res.status(400).json({ message: "This email is already registered with Google. Please sign in with Google." });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User with normalized email
    const newUser = new User({
      email: normalizedEmail,
      password: hashedPassword,
      displayName: displayName || normalizedEmail.split('@')[0],
    });

    await newUser.save();

    // Send Welcome Email
    await sendWelcomeEmail(newUser.email, newUser.displayName);

    // Login immediately after registration
    req.login(newUser, (err) => {
      if (err) return next(err);
      return res.status(201).json({ user: { id: newUser._id, email: newUser.email, name: newUser.displayName } });
    });

  } catch (error) {
    next(error);
  }
};

export const login = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(400).json({ message: info.message });

    req.login(user, (err) => {
      if (err) return next(err);
      return res.json({ user: { id: user._id, email: user.email, name: user.displayName } });
    });
  })(req, res, next);
};

export const logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.clearCookie("connect.sid"); // Default session cookie name
    res.json({ message: "Logged out successfully" });
  });
};

export const getMe = (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: { id: req.user._id, email: req.user.email, name: req.user.displayName } });
  } else {
    res.status(401).json({ user: null });
  }
};