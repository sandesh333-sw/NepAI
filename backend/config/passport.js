import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

// Serialize user to session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Local Strategy (Email/Password)
passport.use(
  new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
    try {
      // Normalize email to lowercase
      const normalizedEmail = email.toLowerCase().trim();
      const user = await User.findOne({ email: normalizedEmail });
      if (!user) return done(null, false, { message: "Incorrect email." });
      if (!user.password) return done(null, false, { message: "Please login with Google." });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return done(null, false, { message: "Incorrect password." });

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

// Google Strategy
// Construct callback URL dynamically based on environment
const getCallbackURL = () => {
  // Check if we have an explicit callback URL set
  if (process.env.GOOGLE_CALLBACK_URL) {
    console.log("🔐 Using explicit GOOGLE_CALLBACK_URL:", process.env.GOOGLE_CALLBACK_URL);
    return process.env.GOOGLE_CALLBACK_URL;
  }
  
  if (process.env.NODE_ENV === "production") {
    // In production, use full URL from environment
    const baseUrl = process.env.BACKEND_URL || process.env.FRONTEND_URL || "https://nepai.pulami.co.uk";
    // Ensure it's a full URL with protocol
    const fullUrl = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`;
    const callbackUrl = `${fullUrl}/api/auth/google/callback`;
    console.log("🔐 Production callback URL:", callbackUrl);
    return callbackUrl;
  }
  // In development, use localhost
  const devCallbackUrl = "http://localhost:8080/api/auth/google/callback";
  console.log("🔐 Development callback URL:", devCallbackUrl);
  console.log("⚠️  Make sure this URL is added to Google Cloud Console!");
  return devCallbackUrl;
};

const callbackURL = getCallbackURL();
console.log("🔐 Google OAuth Callback URL configured:", callbackURL);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: callbackURL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          return done(null, user);
        }

        // Check if user exists with same email but no googleId
        user = await User.findOne({ email: profile.emails[0].value });
        if (user) {
          user.googleId = profile.id;
          await user.save();
          return done(null, user);
        }

        // Create new user
        const newUser = new User({
          googleId: profile.id,
          email: profile.emails[0].value,
          displayName: profile.displayName,
        });
        await newUser.save();
        
        // Send welcome email for new Google users
        const { sendWelcomeEmail } = await import("../utils/emailService.js");
        await sendWelcomeEmail(newUser.email, newUser.displayName);
        
        done(null, newUser);
      } catch (err) {
        done(err);
      }
    }
  )
);