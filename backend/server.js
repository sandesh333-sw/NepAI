import express from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";

import chartRoutes from "./routes/chat.js";
import authRoutes from "./routes/auth.js"; // + Import auth routes
import "./config/passport.js"; // + Import passport config

const app = express();
const PORT = 8080;

// 1. Trust Proxy for Cloudflare/K8s/Traefik
// Set to true to trust all proxies (safe when not directly exposed to internet)
app.set("trust proxy", true);

// 2. Middleware
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true, // Important for cookies
  })
);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Db connected");
  } catch (error) {
    console.log("Failed to connect ", error);
  }
};

// 3. Session Configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "super_secret_key",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: "sessions",
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production", // True for https
      httpOnly: true, // Prevents XSS attacks
      sameSite: "lax", // Works for same-domain (frontend and backend on same domain via Ingress)
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
  })
);

// 4. Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// 5. Routes
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes); 
app.use("/api", chartRoutes);

app.listen(PORT, () => {
  console.log(`server running on ${PORT}`);
  connectDB();
});