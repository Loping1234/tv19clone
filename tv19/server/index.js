import "dotenv/config";
import Job from "./models/Job.js";
import JobApplicant from "./models/JobApplicant.js";
import AdInquiry from "./models/AdInquiry.js";
import express from "express";
import cors from "cors";
import Parser from "rss-parser";

import { fileURLToPath } from "url";
import path from "path";
import multer from "multer";
import cron from "node-cron";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import mongoose from "mongoose";
import connectDB from "./db.js";
import { getConfig, updateConfig } from "./models/SiteConfig.js";
import AdminProfile, { getProfile, updateProfile } from "./models/AdminProfile.js";
import News from "./models/News.js";
import Newsletter from "./models/Newsletter.js";
import RssFeed from "./models/RssFeed.js";
import Subheading from "./models/Subheading.js";
import Poll from "./models/Poll.js";
import TeamMember from "./models/TeamMember.js";
import Category from "./models/Category.js";
import ContactInquiry from "./models/ContactInquiry.js";
import User from "./models/User.js";
import Comment from "./models/Comment.js";
import { OAuth2Client } from "google-auth-library";
import nodemailer from "nodemailer";
import crypto from "crypto";

// ============================================================
//  ENVIRONMENT VALIDATION (P0 Security)
// ============================================================
if (!process.env.JWT_SECRET) {
  console.error("❌ CRITICAL: JWT_SECRET is not set in environment variables!");
  console.error("   Please set JWT_SECRET in your .env file before starting the server.");
  process.exit(1);
}

const JWT_SECRET = process.env.JWT_SECRET;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"];
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ============================================================
//  RATE LIMITING CONFIGURATION (P0 Security)
// ============================================================

// General API rate limiter - 100 requests per minute
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: { error: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for auth endpoints - 10 requests per minute
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: { error: "Too many authentication attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Image scraping endpoint limiter - 30 requests per minute
const scrapeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: { error: "Too many image scrape requests" },
});

// ============================================================
//  REQUEST LOGGING (P1 Improvement)
// ============================================================
app.use(morgan('combined'));

// ============================================================
//  CORS CONFIGURATION (P0 Security)
// ============================================================
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (ALLOWED_ORIGINS.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));


app.use(express.json());

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token." });
    req.user = user;
    next();
  });
};

// ============================================================
//  Auth Routes
// ============================================================

// POST /api/admin/signup - Only for initial setup or if you want multiple admins
app.post("/api/admin/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if an admin already exists (optional: allow multiple if needed)
    const existingAdmin = await AdminProfile.findOne({ email });
    if (existingAdmin) return res.status(400).json({ error: "Admin with this email already exists" });

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const admin = new AdminProfile({ name, email, password, verificationToken });
    await admin.save();

    // Send Verification Email
    const verificationLink = `${BACKEND_URL}/api/admin/verify/${verificationToken}`;

    const mailOptions = {
      from: EMAIL_USER,
      to: email,
      subject: "Verify Your TV19 Admin Account",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #e8380d; text-align: center;">Welcome to TV19 NEWS</h2>
          <p>Hello ${name},</p>
          <p>Thank you for signing up as an administrator. Please click the button below to verify your email address and activate your account:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="background-color: #e8380d; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email Address</a>
          </div>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p><a href="${verificationLink}">${verificationLink}</a></p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #777; text-align: center;">If you didn't create this account, you can safely ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "Signup successful. Please check your email to verify your account." });
  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).json({ error: "Failed to create admin" });
  }
});

// GET /api/admin/verify/:token
app.get("/api/admin/verify/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const admin = await AdminProfile.findOne({ verificationToken: token });

    if (!admin) {
      return res.status(404).send("<h1>Verification failed</h1><p>Invalid or expired token.</p>");
    }

    admin.isVerified = true;
    admin.verificationToken = undefined;
    await admin.save();

    // Redirect to login page on frontend
    res.redirect(`${FRONTEND_URL}?verified=true`);
  } catch (err) {
    console.error("Verification error:", err.message);
    res.status(500).send("<h1>Server Error</h1><p>Failed to verify account.</p>");
  }
});

// POST /api/admin/login
app.post("/api/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await AdminProfile.findOne({ email });

    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (!admin.isVerified) {
      return res.status(403).json({ error: "Please verify your email before logging in." });
    }

    const token = jwt.sign({ id: admin._id, email: admin.email }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, admin: { name: admin.name, email: admin.email, imageUrl: admin.imageUrl } });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Login failed" });
  }
});

// GET /api/admin/me - Verify token and get current admin
app.get("/api/admin/me", authenticateToken, async (req, res) => {
  try {
    const admin = await AdminProfile.findById(req.user.id).select('-password');
    if (!admin) return res.status(404).json({ error: "Admin not found" });
    res.json(admin);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch admin info" });
  }
});

// GET /api/admin/list - Get all registered admins
app.get("/api/admin/list", authenticateToken, async (req, res) => {
  try {
    const admins = await AdminProfile.find().select('-password').sort({ createdAt: -1 });
    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch admin users" });
  }
});

// PUT /api/admin/reset-password
app.put("/api/admin/reset-password", authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Both current and new passwords are required" });
    }

    const admin = await AdminProfile.findById(req.user.id);
    if (!admin) return res.status(404).json({ error: "Admin not found" });

    // Verify current password
    if (!(await admin.comparePassword(currentPassword))) {
      return res.status(401).json({ error: "Incorrect current password" });
    }

    // Update with new password (pre-save hook will hash it)
    admin.password = newPassword;
    await admin.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Reset password error:", err.message);
    res.status(500).json({ error: "Failed to reset password" });
  }
});

// ============================================================
//  Reader Auth Routes (/api/user/*)
// ============================================================

// POST /api/user/signup - Reader signup
app.post("/api/user/signup", authLimiter, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    let user = await User.findOne({ email });
    if (user) {
      if (user.isVerified) {
        return res.status(400).json({ error: "Email is already registered. Please login." });
      }
      // If unverified, we could resend the token, but for now we just update it
    } else {
      user = new User({ name, email, password });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.verificationToken = verificationToken;
    user.isVerified = false;
    await user.save();

    const verificationLink = `${BACKEND_URL}/api/user/verify/${verificationToken}`;

    const mailOptions = {
      from: EMAIL_USER,
      to: email,
      subject: "Verify Your TV19 News Account",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #e8380d; text-align: center;">Welcome to TV19 NEWS</h2>
          <p>Hello ${name},</p>
          <p>Thank you for creating an account. Please click the button below to verify your email address and activate your account:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="background-color: #e8380d; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email Address</a>
          </div>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p><a href="${verificationLink}">${verificationLink}</a></p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "Signup successful. Please check your email to verify your account." });
  } catch (err) {
    console.error("User Signup error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/user/verify/:token
app.get("/api/user/verify/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(404).send("<h1>Verification failed</h1><p>Invalid or expired token.</p>");
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.redirect(`${FRONTEND_URL}/login?verified=true`);
  } catch (err) {
    console.error("Verification error:", err.message);
    res.status(500).send("<h1>Server Error</h1><p>Failed to verify account.</p>");
  }
});

// POST /api/user/login
app.post("/api/user/login", authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ error: "Please verify your email before logging in." });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, imageUrl: user.imageUrl } });
  } catch (err) {
    console.error("User Login error:", err.message);
    res.status(500).json({ error: "Login failed" });
  }
});

// GET /api/user/me
app.get("/api/user/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -verificationToken -resetPasswordToken -resetPasswordExpires');
    if (!user) return res.status(404).json({ error: "User not found" });
    // Make sure we only return reader users (just a safety check, though ID shouldn't overlap with AdminProfile)
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user info" });
  }
});

// POST /api/user/google
app.post("/api/user/google", authLimiter, async (req, res) => {
  try {
    const { access_token } = req.body;
    if (!access_token) return res.status(400).json({ error: "No access_token provided" });

    // Fetch user info from Google
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    if (!response.ok) {
        return res.status(400).json({ error: "Invalid Google access token" });
    }
    const payload = await response.json();

    const { email, name, picture, sub } = payload;

    let user = await User.findOne({ email });
    if (!user) {
      // Auto-verify google users
      user = new User({
        email,
        name,
        imageUrl: picture,
        googleId: sub,
        isVerified: true
      });
      await user.save();
    } else {
      // Update googleId and verify if not already
      user.googleId = sub;
      user.isVerified = true;
      if (!user.imageUrl) user.imageUrl = picture;
      await user.save();
    }

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, imageUrl: user.imageUrl } });
  } catch (err) {
    console.error("Google Auth error:", err.message);
    res.status(500).json({ error: "Google authentication failed" });
  }
});

// POST /api/user/forgot-password
app.post("/api/user/forgot-password", authLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // Return 200 even if user not found to prevent email enumeration
      return res.json({ message: "If your email is registered, a password reset link has been sent." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetLink = `${FRONTEND_URL}/reset-password/${resetToken}`;

    const mailOptions = {
      from: EMAIL_USER,
      to: email,
      subject: "Password Reset Request - TV19 News",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #e8380d; text-align: center;">TV19 NEWS</h2>
          <p>Hello ${user.name},</p>
          <p>You requested a password reset. Please click the button below to set a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #e8380d; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
          </div>
          <p>This link is valid for 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "If your email is registered, a password reset link has been sent." });
  } catch (err) {
    console.error("Forgot password error:", err.message);
    res.status(500).json({ error: "Failed to process request" });
  }
});

// POST /api/user/reset-password
app.post("/api/user/reset-password", authLimiter, async (req, res) => {
  try {
    const { token, password } = req.body;
    
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: "Password reset token is invalid or has expired." });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password has been successfully reset. You can now login." });
  } catch (err) {
    console.error("Reset password error:", err.message);
    res.status(500).json({ error: "Failed to reset password" });
  }
});

// ============================================================
//  Reader Feature Routes — Bookmarks, Comments, Preferences, Notifications
// ============================================================

// --- BOOKMARKS (Save & Read Later) ---

// POST /api/user/bookmarks/:articleId — Save an article
app.post("/api/user/bookmarks/:articleId", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const articleId = req.params.articleId;
    if (user.savedArticles.includes(articleId)) {
      return res.status(400).json({ error: "Article already bookmarked" });
    }

    user.savedArticles.push(articleId);
    await user.save();
    res.json({ message: "Article saved", savedArticles: user.savedArticles });
  } catch (err) {
    console.error("Bookmark save error:", err.message);
    res.status(500).json({ error: "Failed to save article" });
  }
});

// DELETE /api/user/bookmarks/:articleId — Remove a bookmark
app.delete("/api/user/bookmarks/:articleId", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.savedArticles = user.savedArticles.filter(
      (id) => id.toString() !== req.params.articleId
    );
    await user.save();
    res.json({ message: "Bookmark removed", savedArticles: user.savedArticles });
  } catch (err) {
    console.error("Bookmark remove error:", err.message);
    res.status(500).json({ error: "Failed to remove bookmark" });
  }
});

// GET /api/user/bookmarks — Get all saved articles (populated)
app.get("/api/user/bookmarks", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: "savedArticles",
      select: "title description image source category publishedAt views url",
      options: { sort: { publishedAt: -1 } },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ articles: user.savedArticles });
  } catch (err) {
    console.error("Bookmark fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch bookmarks" });
  }
});

// --- COMMENTS (Join the Conversation) ---

// POST /api/comments — Post a new comment
app.post("/api/comments", authenticateToken, async (req, res) => {
  try {
    const { articleId, content, parentComment } = req.body;
    if (!articleId || !content) {
      return res.status(400).json({ error: "articleId and content are required" });
    }
    if (content.length > 2000) {
      return res.status(400).json({ error: "Comment must be under 2000 characters" });
    }

    const comment = new Comment({
      articleId,
      userId: req.user.id,
      content,
      parentComment: parentComment || null,
    });
    await comment.save();

    // Populate user info for the response
    const populated = await Comment.findById(comment._id)
      .populate("userId", "name imageUrl");
    res.status(201).json(populated);
  } catch (err) {
    console.error("Comment post error:", err.message);
    res.status(500).json({ error: "Failed to post comment" });
  }
});

// GET /api/comments/:articleId — Get all comments for an article (public)
app.get("/api/comments/:articleId", async (req, res) => {
  try {
    const comments = await Comment.find({ articleId: req.params.articleId })
      .populate("userId", "name imageUrl")
      .sort({ createdAt: -1 });
    res.json({ comments });
  } catch (err) {
    console.error("Comment fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

// DELETE /api/comments/:commentId — Delete own comment
app.delete("/api/comments/:commentId", authenticateToken, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    if (comment.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: "You can only delete your own comments" });
    }

    // Also delete any replies to this comment
    await Comment.deleteMany({ parentComment: comment._id });
    await Comment.findByIdAndDelete(comment._id);
    res.json({ message: "Comment deleted" });
  } catch (err) {
    console.error("Comment delete error:", err.message);
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

// POST /api/comments/:commentId/like — Like/unlike a comment
app.post("/api/comments/:commentId/like", authenticateToken, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    const userId = req.user.id;
    const alreadyLiked = comment.likes.includes(userId);

    if (alreadyLiked) {
      comment.likes = comment.likes.filter((id) => id.toString() !== userId);
    } else {
      comment.likes.push(userId);
    }
    await comment.save();
    res.json({ likes: comment.likes.length, liked: !alreadyLiked });
  } catch (err) {
    console.error("Comment like error:", err.message);
    res.status(500).json({ error: "Failed to like comment" });
  }
});

// --- PREFERENCES (Personalized Feed) ---

// GET /api/user/preferences — Get user's category preferences
app.get("/api/user/preferences", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("preferences");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user.preferences || { categories: [] });
  } catch (err) {
    console.error("Preferences fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch preferences" });
  }
});

// PUT /api/user/preferences — Save/update category preferences
app.put("/api/user/preferences", authenticateToken, async (req, res) => {
  try {
    const { categories } = req.body;
    if (!Array.isArray(categories)) {
      return res.status(400).json({ error: "categories must be an array" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.preferences = { categories };
    await user.save();
    res.json({ message: "Preferences updated", preferences: user.preferences });
  } catch (err) {
    console.error("Preferences update error:", err.message);
    res.status(500).json({ error: "Failed to update preferences" });
  }
});

// GET /api/user/feed — Personalized feed based on user preferences
app.get("/api/user/feed", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("preferences");
    if (!user) return res.status(404).json({ error: "User not found" });

    const categories = user.preferences?.categories || [];
    const size = parseInt(req.query.size) || 30;
    const skip = parseInt(req.query.skip) || 0;

    let query;
    if (categories.length > 0) {
      // Fetch articles from user's preferred categories
      query = News.find({
        category: { $in: categories },
        status: true,
      });
    } else {
      // Fallback: trending/top articles
      query = News.find({ status: true });
    }

    const articles = await query
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(size)
      .lean();

    res.json({ totalResults: articles.length, articles });
  } catch (err) {
    console.error("Feed fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch personalized feed" });
  }
});

// --- NOTIFICATIONS (Breaking News Alerts) ---

// GET /api/user/notifications — Get notification preferences
app.get("/api/user/notifications", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("notifications");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user.notifications || { breakingNews: false });
  } catch (err) {
    console.error("Notification fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch notification settings" });
  }
});

// PUT /api/user/notifications — Toggle breaking news alerts
app.put("/api/user/notifications", authenticateToken, async (req, res) => {
  try {
    const { breakingNews } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.notifications = {
      ...user.notifications,
      breakingNews: !!breakingNews,
    };
    await user.save();
    res.json({ message: "Notification settings updated", notifications: user.notifications });
  } catch (err) {
    console.error("Notification update error:", err.message);
    res.status(500).json({ error: "Failed to update notification settings" });
  }
});

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Multer config for file uploads
const UPLOADS_DIR = path.join(__dirname, "uploads");
const ALLOWED_FIELDNAMES = ["favicon", "icon", "profileImage"];
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().replace(/[^.a-z0-9]/g, "");
    const safeName = crypto.randomBytes(16).toString("hex") + "-" + Date.now() + ext;
    cb(null, safeName);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

// ============================================================
//  In-memory TTL cache for hot /api/news queries
// ============================================================
const newsCache = new Map();
const CACHE_TTL = 30 * 1000; // 30 seconds for very hot queries

function getCached(key) {
  const entry = newsCache.get(key);
  if (entry && Date.now() < entry.expiresAt) return entry.data;
  newsCache.delete(key);
  return null;
}

function setCache(key, data) {
  newsCache.set(key, { data, expiresAt: Date.now() + CACHE_TTL });
}

function invalidateCache(category) {
  for (const key of newsCache.keys()) {
    if (key.startsWith(category + ":") || key.startsWith("top:") || key.startsWith("trending:")) {
      newsCache.delete(key);
    }
  }
}

// ============================================================
//  Allowed domains for SSRF protection in fetchOgImage
// ============================================================
const ALLOWED_SCRAPE_DOMAINS = [
  // Major Indian news sources
  "timesofindia.indiatimes.com",
  "economictimes.indiatimes.com",
  "indianexpress.com",
  "www.indianexpress.com",
  "www.ndtv.com",
  "www.hindustantimes.com",
  "www.thehindu.com",
  "www.business-standard.com",
  "www.livemint.com",
  "www.firstpost.com",
  "www.news18.com",
  "www.aninews.in",
  "www.pib.gov.in",
  "www.devdiscourse.com",
  "www.telegraphindia.com",
  "www.tribuneindia.com",
  "www.outlookindia.com",
  "www.deccanherald.com",
  "www.newindianexpress.com",
  "www.thenewsminute.com",
  "scroll.in",
  "thewire.in",
  "www.thequint.com",
  "www.moneycontrol.com",
  "www.cnbctv18.com",
  "www.zeebiz.com",
  "www.republicworld.com",
  "www.indiatoday.in",
  "www.aajtak.in",
  "www.abplive.com",
  // International sources
  "feeds.bbci.co.uk",
  "www.bbc.com",
  "www.bbc.co.uk",
  "rss.nytimes.com",
  "www.nytimes.com",
  "news.google.com",
  // Weather sources
  "www.imd.gov.in",
  "weather.com",
  "www.accuweather.com",
  // Aggregators (redirect to real sources)
  "www.google.com",
  "news.yahoo.com",
];

function isAllowedUrl(urlStr) {
  try {
    const { hostname, protocol } = new URL(urlStr);
    if (protocol !== "https:" && protocol !== "http:") return false;
    return ALLOWED_SCRAPE_DOMAINS.some(d => hostname === d || hostname.endsWith("." + d));
  } catch {
    return false;
  }
}

// ============================================================
//  News & Category Counts
// ============================================================

// GET /api/counts/categories — returns real-time article counts per category from MongoDB
app.get("/api/counts/categories", async (_req, res) => {
  try {
    const counts = await News.aggregate([
      { $match: { status: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    const result = {};
    for (const item of counts) {
      if (item._id) result[item._id] = item.count;
    }
    res.json({
      categoryCounts: result,
      totalArticles: Object.values(result).reduce((a, b) => a + b, 0)
    });
  } catch (err) {
    console.error("Category counts error:", err.message);
    res.status(500).json({ error: "Failed to fetch category counts" });
  }
});

// POST /api/contact - Handle contact form submissions
app.post("/api/contact", async (req, res) => {
  try {
    const { firstName, lastName, email, phone, reason, message } = req.body;
    if (!firstName || !lastName || !email || !phone || !reason || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Save to database
    const inquiry = new ContactInquiry({
      firstName, lastName, email, phone, reason, message
    });
    await inquiry.save();

    const userName = `${firstName} ${lastName}`;
    const year = new Date().getFullYear();

    // The user specifically corrected their instructions to say:
    // "This screenshot of response is in the email template of contact us... it should go as an auto-responder to the person who filled out the form."
    // Let's create the HTML matching the exact screenshot but addressed to the user.
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-size: 24px; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 10px;">
            <div style="background: #fbbf24; color: #fff; width: 40px; height: 40px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 16px;">TV</div>
            <span style="font-size: 18px;">19</span> 
            <span style="font-size: 28px; font-weight: 900;">NEWS</span>
          </h1>
        </div>

        <h2 style="color: #1f2937; font-size: 22px; margin-bottom: 20px;">New Contact Us Submission</h2>
        
        <p style="color: #4b5563; font-size: 16px; margin-bottom: 30px;">
          Thank you for contacting TV19. Here is a copy of your inquiry:
        </p>

        <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 25px; margin-bottom: 30px;">
          <h3 style="font-size: 18px; margin-top: 0; margin-bottom: 20px; color: #111827;">Contact Details</h3>
          
          <p style="margin: 0 0 15px 0;"><strong>Name:</strong> ${userName}</p>
          <p style="margin: 0 0 15px 0;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 0 0 15px 0;"><strong>Phone:</strong> ${phone}</p>
          <p style="margin: 0 0 5px 0;"><strong>Message:</strong></p>
          <p style="margin: 0; color: #4b5563; white-space: pre-wrap;">${message}</p>
        </div>

        <p style="color: #4b5563; font-size: 16px; margin-bottom: 30px;">
          We will respond to this inquiry at our earliest convenience.
        </p>

        <p style="color: #4b5563; margin-bottom: 0;">Thanks,</p>
        <p style="color: #111827; font-weight: bold; margin-top: 5px;">TV19News Support Team</p>

        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <div style="text-align: center; color: #9ca3af; font-size: 14px;">
          &copy; ${year} TV19News. All rights reserved.
        </div>
      </div>
    `;

    // Send email to the user (auto-responder)
    await transporter.sendMail({
      from: `"TV19News Support" <${EMAIL_USER}>`,
      to: email, // Send to the person who filled out the form
      subject: "Thank you for contacting TV19News",
      html: emailHtml,
    });

    res.json({ message: "Inquiry submitted successfully", id: inquiry._id });
  } catch (err) {
    console.error("Contact Form Error:", err);
    res.status(500).json({ error: "Failed to process inquiry" });
  }
});

// POST /api/newsletter/subscribe — add user email to newsletter list
app.post("/api/newsletter/subscribe", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const existing = await Newsletter.findOne({ email });
    if (existing) {
      if (!existing.active) {
        existing.active = true;
        await existing.save();
        return res.json({ message: "Welcome back! You've been re-subscribed." });
      }
      return res.status(400).json({ error: "Email is already subscribed" });
    }

    const newSub = new Newsletter({ email });
    await newSub.save();
    res.json({ message: "Successfully subscribed to the newsletter!" });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: "Invalid email format" });
    }
    console.error("Newsletter subscribe error:", err.message);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

// ============================================================
//  Team Members Routes
// ============================================================

app.get("/api/team-members", async (req, res) => {
  try {
    const members = await TeamMember.find().sort({ createdAt: -1 });
    res.json({ members });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch team members" });
  }
});

app.post("/api/team-members", authenticateToken, async (req, res) => {
  try {
    const { name, role, description, status } = req.body;
    if (!name || !role) return res.status(400).json({ error: "Name and role are required" });
    
    const newMember = new TeamMember({ name, role, description, status });
    await newMember.save();
    res.status(201).json(newMember);
  } catch (err) {
    res.status(500).json({ error: "Failed to create team member" });
  }
});

app.put("/api/team-members/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, description, status } = req.body;
    
    const updated = await TeamMember.findByIdAndUpdate(id, { name, role, description, status }, { new: true });
    if (!updated) return res.status(404).json({ error: "Team member not found" });
    
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update team member" });
  }
});

app.delete("/api/team-members/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await TeamMember.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Team member not found" });
    
    res.json({ message: "Team member deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete team member" });
  }
});

app.post("/api/team-members/:id/upload-image", authenticateToken, (req, res, next) => {
  upload.single("memberImage")(req, res, (err) => {
    if (err) {
      console.error("🚀 Multer Error:", err);
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }
    
    const { id } = req.params;
    const imageUrl = `/uploads/${req.file.filename}`;
    
    const updated = await TeamMember.findByIdAndUpdate(id, { imageUrl }, { new: true });
    if (!updated) return res.status(404).json({ error: "Team member not found" });
    
    res.json(updated);
  } catch (err) {
    console.error("🚀 DB Error:", err);
    res.status(500).json({ error: "Failed to upload image: " + err.message });
  }
});

// ============================================================
// ============================================================
//  Advertising Inquiry Routes
// ============================================================

app.get("/api/ad-inquiries", authenticateToken, async (req, res) => {
  try {
    const inquiries = await AdInquiry.find().sort({ date: -1 });
    res.json(inquiries);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch ad inquiries" });
  }
});

app.post("/api/ad-inquiries", async (req, res) => {
  try {
    const inquiry = new AdInquiry(req.body);
    await inquiry.save();
    res.status(201).json(inquiry);
  } catch (err) {
    res.status(500).json({ error: "Failed to submit inquiry" });
  }
});

app.put("/api/ad-inquiries/:id", authenticateToken, async (req, res) => {
  try {
    const updated = await AdInquiry.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update inquiry" });
  }
});

app.delete("/api/ad-inquiries/:id", authenticateToken, async (req, res) => {
  try {
    await AdInquiry.findByIdAndDelete(req.params.id);
    res.json({ message: "Inquiry deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete inquiry" });
  }
});

// ============================================================
//  Job Board Routes (Jobs & Applicants)
// ============================================================

// Jobs
app.get("/api/jobs", async (req, res) => {
  try {
    const jobs = await Job.find().sort({ postingDate: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

app.post("/api/jobs", authenticateToken, async (req, res) => {
  try {
    const job = new Job(req.body);
    await job.save();
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ error: "Failed to create job" });
  }
});

app.put("/api/jobs/:id", authenticateToken, async (req, res) => {
  try {
    const updated = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update job" });
  }
});

app.delete("/api/jobs/:id", authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    await Job.findByIdAndDelete(id);
    await JobApplicant.deleteMany({ jobId: id });
    res.json({ message: "Job and associated applicants deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete job" });
  }
});

// Job Applicants
app.get("/api/job-applicants", authenticateToken, async (req, res) => {
  try {
    const applicants = await JobApplicant.find().populate("jobId", "title").sort({ appliedOn: -1 });
    res.json(applicants);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch applicants" });
  }
});

app.post("/api/job-applicants", async (req, res) => {
  try {
    const applicant = new JobApplicant(req.body);
    await applicant.save();
    res.status(201).json(applicant);
  } catch (err) {
    res.status(500).json({ error: "Failed to submit application" });
  }
});

app.put("/api/job-applicants/:id", authenticateToken, async (req, res) => {
  try {
    const updated = await JobApplicant.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update applicant" });
  }
});

app.delete("/api/job-applicants/:id", authenticateToken, async (req, res) => {
  try {
    await JobApplicant.findByIdAndDelete(req.params.id);
    res.json({ message: "Applicant deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete applicant" });
  }
});

//  Category Management Routes
// ============================================================

app.get("/api/categories", async (req, res) => {
  try {
    const categories = await Category.find().sort({ order: 1, name: 1 });
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// Dynamic Navigation Hierarchy for Navbar
app.get("/api/navbar", async (req, res) => {
  try {
    const categories = await Category.find({ status: true }).sort({ order: 1 });
    const subheadings = await Subheading.find({ status: true }).sort({ order: 1 });

    const navbar = categories.map(cat => {
      const children = subheadings.filter(sub => sub.category === cat.slug);
      return {
        ...cat.toObject(),
        subheadings: children
      };
    });

    res.json(navbar);
  } catch (err) {
    res.status(500).json({ error: "Failed to build navigation" });
  }
});

app.post("/api/categories", authenticateToken, async (req, res) => {
  try {
    const { name, slug, description, metaKeyword, metaDescription, status, order, rssUrls } = req.body;
    if (!name || !slug) return res.status(400).json({ error: "Name and Slug are required" });

    const category = new Category({ name, slug, description, metaKeyword, metaDescription, status, order, rssUrls });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: "Failed to create category: " + err.message });
  }
});

app.put("/api/categories/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const updated = await Category.findByIdAndUpdate(id, body, { new: true });
    if (!updated) return res.status(404).json({ error: "Category not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update category" });
  }
});

// Subheading Management Routes
app.get("/api/subheadings", async (req, res) => {
  try {
    const subheadings = await Subheading.find().sort({ order: 1, label: 1 });
    res.json({ subheadings });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch subheadings" });
  }
});

app.post("/api/subheadings", authenticateToken, async (req, res) => {
  try {
    const { category, label, slug, order, status, rssUrls } = req.body;
    if (!category || !label) return res.status(400).json({ error: "Category and Label are required" });

    const subheading = new Subheading({ 
      category, 
      label, 
      slug: slug || label.toLowerCase().replace(/\s+/g, '-'), 
      order, 
      status, 
      rssUrls 
    });
    await subheading.save();
    res.status(201).json(subheading);
  } catch (err) {
    res.status(500).json({ error: "Failed to create subheading: " + err.message });
  }
});

app.put("/api/subheadings/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Subheading.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: "Subheading not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update subheading" });
  }
});

app.delete("/api/subheadings/:id", authenticateToken, async (req, res) => {
  try {
    await Subheading.findByIdAndDelete(req.params.id);
    res.json({ message: "Subheading deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete subheading" });
  }
});

app.delete("/api/categories/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Category not found" });
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete category" });
  }
});

app.post("/api/categories/bulk-delete", authenticateToken, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids)) return res.status(400).json({ error: "Invalid IDs" });
    await Category.deleteMany({ _id: { $in: ids } });
    res.json({ message: "Categories deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete common categories" });
  }
});

// Global error handlers to prevent silent exits
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED REJECTION:", reason);
});

// ============================================================
//  NEW RSS ENGINE v2 — Fresh, Reliable, Image-Rich
// ============================================================

// RSS Parser — configured to extract media fields from feeds
const rssParser = new Parser({
  customFields: {
    item: [
      ["media:content", "mediaContent", { keepArray: false }],
      ["media:thumbnail", "mediaThumbnail", { keepArray: false }],
    ],
  },
});

// ── RSS Configuration ──────────────────────────────────────
// Now managed dynamically via Categories and Subheadings in MongoDB.
// Hardcoded fallbacks are handled within buildFeedUrls().
const FEED_MAP = {}; 

// Build URLs from the feed config (DB or Hardcoded Map)
function buildFeedUrls(config, categoryKey) {
  const urls = [];
  if (config) {
    // 1. Custom URLs from DB
    if (config.rssUrls && config.rssUrls.length > 0) urls.push(...config.rssUrls);
    if (config.custom) urls.push(...config.custom);
    
    // 2. Hardcoded Provider Logic (Backward Compatibility)
    if (config.topic) urls.push(config.topic);
    if (config.gq) {
      const q = encodeURIComponent(config.gq);
      urls.push(`https://news.google.com/rss/search?q=${q}&hl=en-IN&gl=IN&ceid=IN:en`);
    }
    if (config.bbc) {
      urls.push(`https://feeds.bbci.co.uk/${config.bbc}`);
    }
  } 
  
  // 3. Absolute Fallback: if no URLs found, do a generic Google Search
  if (urls.length === 0) {
    const query = encodeURIComponent(categoryKey + " news today");
    urls.push(`https://news.google.com/rss/search?q=${query}&hl=en-IN&gl=IN&ceid=IN:en`);
  }
  return [...new Set(urls)]; // Deduplicate URLs
}

// ── Article Normalizer ──────────────────────────────────────
// Takes a raw rss-parser item and returns a clean article object
function normalizeArticle(item, feedTitle) {
  // 1. Title — strip Google News suffix "Headline - Source"
  let title = (item.title || "").trim();
  let source = feedTitle || "Unknown";
  if (feedTitle && (feedTitle === "Google News" || feedTitle.includes("Google News") || feedTitle.includes("google.com"))) {
    const dashIdx = title.lastIndexOf(" - ");
    if (dashIdx > 0) {
      source = title.substring(dashIdx + 3).trim();
      title = title.substring(0, dashIdx).trim();
    }
  }

  // 2. Image — ordered priority, stop at first hit
  let image = null;
  // a) media:thumbnail (BBC primary)
  if (item.mediaThumbnail) {
    if (typeof item.mediaThumbnail === "string") image = item.mediaThumbnail;
    else if (item.mediaThumbnail.$?.url) image = item.mediaThumbnail.$.url;
    else if (item.mediaThumbnail.url) image = item.mediaThumbnail.url;
  }
  // b) media:content (image type)
  if (!image && item.mediaContent) {
    const mc = item.mediaContent;
    const url = mc.$?.url || mc.url;
    const medium = mc.$?.medium || mc.medium || mc.$?.type || "";
    if (url && (!medium || medium === "image" || medium.startsWith("image"))) {
      image = url;
    }
  }
  // c) enclosure
  if (!image && item.enclosure?.url) {
    const type = item.enclosure.type || "";
    if (type.startsWith("image") || !type) {
      image = item.enclosure.url;
    }
  }
  // d) Inline <img> in content/description (Aggressive multi-pattern)
  if (!image) {
    const htmlContent = item["content:encoded"] || item.content || item.description || "";
    if (typeof htmlContent === "string") {
      const imgMatch = 
        htmlContent.match(/<img.*?src=["']([^"']+)["']/i) ||
        htmlContent.match(/&lt;img.*?src=["']([^"']+)["']/i) ||
        htmlContent.match(/src=["']([^"']+\.(?:jpg|jpeg|png|webp|gif)[^"']*)["']/i) ||
        htmlContent.match(/https?:\/\/[^"'\s]+\.(?:jpg|jpeg|png|webp|gif)/i);
      
      if (imgMatch) image = imgMatch[1] || imgMatch[0];
    }
  }

  // 3. Description — plain text
  let description = item.contentSnippet || "";
  if (!description && item.content) {
    // Strip HTML tags for a clean snippet
    description = item.content.replace(/<[^>]+>/g, "").trim().substring(0, 300);
  }

  // 4. Published date — validate it's not in the future
  let publishedAt = item.isoDate ? new Date(item.isoDate) : new Date();
  if (isNaN(publishedAt.getTime()) || publishedAt > new Date(Date.now() + 3600000)) {
    publishedAt = new Date();
  }

  return {
    title,
    description,
    url: item.link || "",
    image,
    source,
    publishedAt,
    content: item.content || "",
  };
}

// ── Single Feed Fetcher ─────────────────────────────────────
async function fetchSingleFeed(url, label) {
  try {
    // Add small random jitter (0-1.5s) to avoid "thundering herd" patterns
    await new Promise(r => setTimeout(r, Math.random() * 1500));
    
    const feed = await rssParser.parseURL(url);
    
    if (!feed || !feed.items) return [];
    return feed.items.map((item) => normalizeArticle(item, feed.title));
  } catch (err) {
    console.warn(`  ⚠️ Feed failed [${label}]: ${err.message}`);
    return [];
  }
}

// Lock to prevent concurrent RSS refresh jobs
let isRssRefreshing = false;

// ── Main Refresh Engine ─────────────────────────────────────
async function refreshAllFeeds() {
  if (isRssRefreshing) {
    console.log("⚠️ RSS refresh already in progress, skipping...");
    return { success: false, error: "Already in progress" };
  }

  isRssRefreshing = true;
  console.log("🔄 Starting RSS fetch job...");
  const startTime = Date.now();
  let totalProcessed = 0;
  const allNewArticles = []; // Track articles for background image enrichment

  try {
    // 1. Fetch all active Categories and Subheadings from DB
    const activeCategories = await Category.find({ status: true });
    const activeSubheadings = await Subheading.find({ status: true });

    // 2. Create a unified list of fetch jobs
    const fetchJobs = [];
    
    // Add Main Categories
    activeCategories.forEach(cat => {
        fetchJobs.push({ 
            key: cat.slug, 
            config: { ...cat.toObject(), ... (FEED_MAP[cat.slug] || {}) } 
        });
    });

    // Add Subheadings (Cities/Regions)
    activeSubheadings.forEach(sub => {
        fetchJobs.push({ 
            key: sub.slug, 
            config: { ...sub.toObject(), ... (FEED_MAP[sub.slug] || {}) } 
        });
    });

    const BATCH_SIZE = 1; 
    for (let i = 0; i < fetchJobs.length; i += BATCH_SIZE) {
      const batch = fetchJobs.slice(i, i + BATCH_SIZE);

      await Promise.allSettled(
        batch.map(async (job) => {
          const urls = buildFeedUrls(job.config, job.key);
          console.log(`  📡 Fetching: ${job.key} (${urls.length} source${urls.length > 1 ? "s" : ""})`);

          const results = await Promise.allSettled(
            urls.map((url) => fetchSingleFeed(url, job.key))
          );

          let articles = [];
          for (const r of results) {
            if (r.status === "fulfilled") articles.push(...r.value);
          }

          // Deduplicate
          articles = deduplicateByTitle(articles);
          if (articles.length === 0) return;

          // Upsert into MongoDB
          const saveOps = articles.map((article) =>
            News.findOneAndUpdate(
              { url: article.url },
              {
                $set: {
                  title: article.title,
                  description: article.description,
                  // Only update image if the new value is non-null
                  ...(article.image ? { image: article.image } : {}),
                  source: article.source,
                  category,
                  publishedAt: article.publishedAt,
                  content: article.content,
                },
                $setOnInsert: { status: true },
              },
              { upsert: true }
            )
          );
          await Promise.allSettled(saveOps);
          totalProcessed += articles.length;
          allNewArticles.push(...articles.filter((a) => !a.image));
        })
      );

      // Staggered delay: 8 seconds between categories
      if (i + BATCH_SIZE < categoryKeys.length) {
        await new Promise((r) => setTimeout(r, 8000));
      }
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✅ RSS fetch complete. ${totalProcessed} articles across ${categoryKeys.length} categories in ${elapsed}s`);

    // Phase 2: Background image enrichment for articles missing images
    if (allNewArticles.length > 0) {
      console.log(`🖼️ Starting background image enrichment for ${Math.min(allNewArticles.length, 100)} articles...`);
      enrichMissingImages().catch((err) => console.error("Image enrichment error:", err.message));
    }

    return { success: true, totalProcessed };
  } catch (error) {
    console.error("❌ RSS fetch error:", error.message);
    return { success: false, error: error.message };
  } finally {
    isRssRefreshing = false;
  }
}

async function enrichMissingImages(category = null, limit = 50) {
  const query = {
    image: { $in: [null, ""] },
    publishedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  };
  if (category) query.category = category;

  const articlesWithoutImages = await News.find(query)
    .sort({ publishedAt: -1 })
    .limit(limit)
    .lean();

  if (articlesWithoutImages.length === 0) return;

  const MICRO_BATCH = 3;
  for (let i = 0; i < articlesWithoutImages.length; i += MICRO_BATCH) {
    const batch = articlesWithoutImages.slice(i, i + MICRO_BATCH);

    await Promise.allSettled(
      batch.map(async (article) => {
        if (!article.url) return;
        const ogImage = await fetchOgImage(article.url);
        if (ogImage) {
          await News.updateOne(
            { _id: article._id },
            { $set: { image: ogImage } }
          );
        }
      })
    );

    // 1-second pause between micro-batches
    if (i + MICRO_BATCH < articlesWithoutImages.length) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  console.log("✅ Background image enrichment complete.");
}

// ── Category Sync ───────────────────────────────────────────
async function syncCategories() {
  try {
    const categoryKeys = Object.keys(FEED_MAP);
    for (const key of categoryKeys) {
      const slug = key.toLowerCase().replace(/\s+/g, "-");
      const name = key.charAt(0).toUpperCase() + key.slice(1);
      const exists = await Category.findOne({ slug });
      if (!exists) {
        await new Category({ name, slug, status: true }).save();
        console.log(`  ✅ Auto-synced category: ${name}`);
      }
    }
  } catch (err) {
    console.error("❌ Category sync error:", err.message);
  }
}

async function identifySubheadings() {
  try {
    const feedsWithLabels = await RssFeed.find({ subheading: { $exists: true, $ne: "" } });
    if (feedsWithLabels.length === 0) return;
    for (const feed of feedsWithLabels) {
      if (!feed.category || !feed.subheading) continue;
      const exists = await Subheading.findOne({ category: feed.category.toLowerCase().trim() });
      if (!exists) {
        await new Subheading({
          category: feed.category.toLowerCase().trim(),
          label: feed.subheading.trim(),
        }).save();
        console.log(`  🏷️ Synced subheading: [${feed.category}] -> ${feed.subheading}`);
      }
    }
  } catch (err) {
    console.error("❌ Subheading sync error:", err.message);
  }
}

// Startup sync (delayed to let DB connect)
setTimeout(async () => {
  await syncCategories();
  await identifySubheadings();
}, 5000);


// GET /api/news?category=top&size=10&imagesOnly=true
app.get("/api/news", async (req, res) => {
  try {
    const categoryQuery = (req.query.category || "top").toString().toLowerCase();
    const size = Math.min(Math.max(parseInt(req.query.size) || 20, 1), 50);
    const skip = Math.max(parseInt(req.query.skip) || 0, 0);
    const imagesOnly = req.query.imagesOnly === "true";

    const dbQuery = { status: true };

    if (categoryQuery !== "top" && categoryQuery !== "trending") {
      dbQuery.category = categoryQuery;
    }

    if (imagesOnly) {
      dbQuery.image = { $nin: [null, ""] };
    }

    const articles = await News.find(dbQuery)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(size);

    res.json({ totalResults: articles.length, articles });
  } catch (err) {
    console.error("News fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch news from database" });
  }
});

// GET /api/news/state?state=Rajasthan&size=15&skip=0
// Dynamic: if DB is empty or stale for this category, fetches live from Google News RSS
app.get("/api/news/state", async (req, res) => {
  try {
    const stateName = (req.query.state || req.query.category || "Rajasthan").toString().trim();
    const size = Math.min(Math.max(parseInt(req.query.size) || 15, 1), 50);
    const skip = Math.max(parseInt(req.query.skip) || 0, 0);
    const categoryKey = stateName.toLowerCase();

    if (!stateName) {
      return res.status(400).json({ error: "Query parameter 'state' is required" });
    }

    // Step 1: Check what we have in the database
    let articles = await News.find({ status: true, category: categoryKey })
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(size);

    // Step 2: If empty or stale (>4 hours), do a live RSS fetch
    let needsLiveFetch = false;
    if (skip === 0) {
      if (articles.length < 3) {
        needsLiveFetch = true;
      } else {
        const latestDate = new Date(articles[0].publishedAt);
        const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
        if (latestDate < thirtyMinsAgo) needsLiveFetch = true;
      }
    }

    if (needsLiveFetch && skip === 0) {
      try {
        // Fetch config from DB (Category or Subheading)
        const catConfig = await Category.findOne({ slug: categoryKey });
        const subConfig = await Subheading.findOne({ slug: categoryKey });
        const mergedConfig = {
          ...(catConfig ? catConfig.toObject() : {}),
          ...(subConfig ? subConfig.toObject() : {}),
          ...(FEED_MAP[categoryKey] || {})
        };

        const urls = buildFeedUrls(mergedConfig, categoryKey);
        const results = await Promise.allSettled(
          urls.map((url) => fetchSingleFeed(url, categoryKey))
        );

        let liveArticles = [];
        for (const r of results) {
          if (r.status === "fulfilled") liveArticles.push(...r.value);
        }
        liveArticles = deduplicateByTitle(liveArticles)
          .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
          .slice(0, size * 2);

        if (liveArticles.length > 0) {
          // Save to DB
          const saveOps = liveArticles.map((article) =>
            News.findOneAndUpdate(
              { url: article.url },
              {
                $set: {
                  title: article.title,
                  description: article.description,
                  ...(article.image ? { image: article.image } : {}),
                  source: article.source,
                  category: categoryKey,
                  publishedAt: article.publishedAt,
                  content: article.content,
                },
                $setOnInsert: { status: true },
              },
              { upsert: true }
            )
          );
          await Promise.allSettled(saveOps);

          // Proactively enrich missing images for this state
          // We await a small batch (top 5) so the user gets images on the FIRST load
          await enrichMissingImages(categoryKey, 5).catch((err) =>
            console.error(`Quick enrichment error for ${categoryKey}:`, err.message)
          );

          // Then continue background enrichment for the rest
          enrichMissingImages(categoryKey, 45).catch((err) =>
            console.error(`Background enrichment error for ${categoryKey}:`, err.message)
          );

          // Re-fetch from DB to get clean, saved articles
          articles = await News.find({ status: true, category: categoryKey })
            .sort({ publishedAt: -1 })
            .limit(size);
        }
      } catch (liveErr) {
        console.warn(`Live fetch failed for ${stateName}:`, liveErr.message);
      }
    }

    res.json({ totalResults: articles.length, articles });
  } catch (err) {
    console.error("State fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch state news from database" });
  }
});

// GET /api/news/scrape-image?url=...&brokenImage=...
// Attempts to rescrape an article's webpage if the original image fails on frontend
app.get("/api/news/scrape-image", scrapeLimiter, async (req, res) => {
  try {
    const articleUrl = (req.query.url || "").toString().trim();
    const brokenImage = (req.query.brokenImage || "").toString().trim();

    if (!articleUrl) {
      return res.status(400).json({ error: "Query parameter 'url' is required" });
    }

    const scrapedImage = await fetchOgImage(articleUrl);

    if (scrapedImage && scrapedImage !== brokenImage) {
      await News.updateOne(
        { url: articleUrl },
        { $set: { image: scrapedImage } }
      );
      return res.json({ imageUrl: scrapedImage });
    }

    return res.status(404).json({ error: "No valid fallback image found on the article page" });
  } catch (err) {
    console.error("Scrape fallback image error:", err.message);
    res.status(500).json({ error: "Failed to scrape fallback image" });
  }
});

// GET /api/news/search?q=keyword&size=10&category=top
// Searches across MongoDB articles using regex
app.get("/api/news/search", async (req, res) => {
  try {
    const query = (req.query.q || "").toString().trim();
    const size = parseInt(req.query.size) || 20;
    const category = (req.query.category || "").toString().toLowerCase();

    if (!query) {
      return res.status(400).json({ error: "Query parameter 'q' is required" });
    }

    const dbQuery = { status: true }; // Only active news

    // Add regex search across title, description, content
    dbQuery.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
      { content: { $regex: query, $options: "i" } },
    ];

    if (category && category !== "top" && category !== "trending") {
      dbQuery.category = category;
    }

    const articles = await News.find(dbQuery)
      .sort({ publishedAt: -1 })
      .limit(size);

    res.json({ totalResults: articles.length, articles });
  } catch (err) {
    console.error("RSS search error:", err.message);
    res.status(500).json({ error: "Failed to search news database" });
  }
});

// GET /api/news/categories — returns list of all supported categories
app.get("/api/news/categories", async (_req, res) => {
  try {
    const categories = await Category.find({ status: true }).distinct("slug");
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// GET /api/news/:id - Fetch single article
app.get("/api/news/:id", async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next();
    }
    const article = await News.findById(req.params.id);
    if (!article) return res.status(404).json({ error: "Article not found" });
    res.json({ article });
  } catch (err) {
    console.error("Fetch article error:", err.message);
    res.status(500).json({ error: "Failed to fetch article" });
  }
});

// POST /api/news/:id/view - Increment view count
app.post("/api/news/:id/view", async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next();
    }
    await News.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    res.json({ success: true });
  } catch (err) {
    console.error("Update view error:", err.message);
    res.status(500).json({ error: "Failed to update article view" });
  }
});



// ============================================================
//  Subheadings API
// ============================================================

// GET /api/subheadings — all subheadings (public, used by frontend)
app.get("/api/subheadings", async (_req, res) => {
  try {
    const subheadings = await Subheading.find().sort({ category: 1 });
    res.json({ subheadings });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch subheadings" });
  }
});

// POST /api/subheadings — create or update a subheading for a category
app.post("/api/subheadings", authenticateToken, async (req, res) => {
  try {
    const { category, label } = req.body;
    if (!category || !label) return res.status(400).json({ error: "category and label are required" });
    const subheading = await Subheading.findOneAndUpdate(
      { category: category.toLowerCase().trim() },
      { label: label.trim() },
      { upsert: true, new: true, runValidators: true }
    );
    res.json(subheading);
  } catch (err) {
    res.status(500).json({ error: "Failed to save subheading" });
  }
});

// PUT /api/subheadings/:id — update label
app.put("/api/subheadings/:id", authenticateToken, async (req, res) => {
  try {
    const { label } = req.body;
    if (!label) return res.status(400).json({ error: "label is required" });
    const subheading = await Subheading.findByIdAndUpdate(
      req.params.id,
      { label: label.trim() },
      { new: true, runValidators: true }
    );
    if (!subheading) return res.status(404).json({ error: "Subheading not found" });
    res.json(subheading);
  } catch (err) {
    res.status(500).json({ error: "Failed to update subheading" });
  }
});

// DELETE /api/subheadings/:id
app.delete("/api/subheadings/:id", authenticateToken, async (req, res) => {
  try {
    const subheading = await Subheading.findByIdAndDelete(req.params.id);
    if (!subheading) return res.status(404).json({ error: "Subheading not found" });
    res.json({ message: "Subheading deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete subheading" });
  }
});

// GET /api/rss-feeds — returns all configured RSS feed URLs with categories
app.get("/api/rss-feeds", async (_req, res) => {
  try {
    const feeds = await RssFeed.find().sort({ createdAt: -1 });
    res.json({ totalFeeds: feeds.length, feeds });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch RSS feeds" });
  }
});

// GET /api/rss-feeds/:id
app.get("/api/rss-feeds/:id", async (req, res) => {
  try {
    const feed = await RssFeed.findById(req.params.id);
    if (!feed) return res.status(404).json({ error: "Feed not found" });
    res.json(feed);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch feed" });
  }
});

// PUT /api/rss-feeds/:id
app.put("/api/rss-feeds/:id", authenticateToken, async (req, res) => {
  try {
    const { url, category, subheading, status } = req.body;
    const feed = await RssFeed.findByIdAndUpdate(
      req.params.id,
      { url, category, subheading, status },
      { returnDocument: 'after', runValidators: true }
    );
    if (!feed) return res.status(404).json({ error: "Feed not found" });
    res.json(feed);
  } catch (err) {
    res.status(500).json({ error: "Failed to update feed" });
  }
});

// POST /api/rss-feeds
app.post("/api/rss-feeds", authenticateToken, async (req, res) => {
  try {
    const { url, category, subheading, status } = req.body;
    const feed = new RssFeed({ url, category, subheading, status });
    await feed.save();
    res.json(feed);
  } catch (err) {
    res.status(500).json({ error: "Failed to create feed. It might already exist." });
  }
});

// DELETE /api/rss-feeds/:id
app.delete("/api/rss-feeds/:id", authenticateToken, async (req, res) => {
  try {
    const feed = await RssFeed.findByIdAndDelete(req.params.id);
    if (!feed) return res.status(404).json({ error: "Feed not found" });
    res.json({ message: "Feed deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete feed" });
  }
});


// ============================================================
//  Polls API
// ============================================================

// GET /api/polls — list all polls (admin)
app.get("/api/polls", async (_req, res) => {
  try {
    const polls = await Poll.find().sort({ createdAt: -1 });
    res.json(polls);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch polls" });
  }
});

// GET /api/polls/active — get the currently active poll (frontend widget)
app.get("/api/polls/active", async (_req, res) => {
  try {
    const poll = await Poll.findOne({ status: true }).sort({ createdAt: -1 });
    if (!poll) return res.json(null); // Return 200 with null instead of 404
    res.json(poll);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch active poll" });
  }
});

// POST /api/polls — create a new poll (admin)
app.post("/api/polls", authenticateToken, async (req, res) => {
  try {
    const { question, options, status, featured, startDate, endDate } = req.body;
    if (!question || !options || options.length < 2) {
      return res.status(400).json({ error: "Question and at least 2 options are required" });
    }
    const poll = new Poll({
      question,
      options: options.map((text) => ({ text, votes: 0 })),
      status: status !== undefined ? status : true,
      featured,
      startDate,
      endDate,
    });
    await poll.save();
    res.status(201).json(poll);
  } catch (err) {
    res.status(500).json({ error: "Failed to create poll" });
  }
});

// PUT /api/polls/:id — update a poll (admin)
app.put("/api/polls/:id", authenticateToken, async (req, res) => {
  try {
    const updated = await Poll.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: "Poll not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update poll" });
  }
});

// DELETE /api/polls/:id — delete a poll (admin)
app.delete("/api/polls/:id", authenticateToken, async (req, res) => {
  try {
    const deleted = await Poll.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Poll not found" });
    res.json({ message: "Poll deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete poll" });
  }
});

// POST /api/polls/:id/vote — vote on a poll option (public)
app.post("/api/polls/:id/vote", async (req, res) => {
  try {
    const { optionId } = req.body;
    if (!optionId) return res.status(400).json({ error: "optionId is required" });

    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ error: "Poll not found" });
    if (!poll.status) return res.status(400).json({ error: "Poll is no longer active" });

    const option = poll.options.id(optionId);
    if (!option) return res.status(400).json({ error: "Invalid option" });

    option.votes += 1;
    poll.totalVotes += 1;
    await poll.save();
    res.json(poll);
  } catch (err) {
    res.status(500).json({ error: "Failed to record vote" });
  }
});

// ============================================================
//  Site Configuration API (MongoDB)
// ============================================================

// GET /api/config — fetch current site config
app.get("/api/config", async (_req, res) => {
  try {
    const config = await getConfig();
    res.json(config);
  } catch (err) {
    console.error("Config fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch config" });
  }
});

// PUT /api/config — update text fields
app.put("/api/config", authenticateToken, async (req, res) => {
  try {
    const allowed = ["siteName", "siteEmail", "officeAddress", "recaptchaSiteKey", "recaptchaSecretKey"];
    const data = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) data[key] = req.body[key];
    }
    const config = await updateConfig(data);
    res.json(config);
  } catch (err) {
    console.error("Config update error:", err.message);
    res.status(500).json({ error: "Failed to update config" });
  }
});

// POST /api/config/upload-favicon — upload favicon image
app.post("/api/config/upload-favicon", authenticateToken, upload.single("favicon"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const faviconUrl = `/uploads/${req.file.filename}`;
    const config = await updateConfig({ faviconUrl });
    res.json({ faviconUrl: config.faviconUrl, message: "Favicon uploaded" });
  } catch (err) {
    console.error("Favicon upload error:", err.message);
    res.status(500).json({ error: "Failed to upload favicon" });
  }
});

// POST /api/config/upload-icon — upload site icon
app.post("/api/config/upload-icon", authenticateToken, upload.single("icon"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const siteIconUrl = `/uploads/${req.file.filename}`;
    const config = await updateConfig({ siteIconUrl });
    res.json({ siteIconUrl: config.siteIconUrl, message: "Site icon uploaded" });
  } catch (err) {
    console.error("Icon upload error:", err.message);
    res.status(500).json({ error: "Failed to upload site icon" });
  }
});

// ============================================================
//  Admin Profile API
// ============================================================

// GET /api/admin/profile — fetch admin profile
app.get("/api/admin/profile", authenticateToken, async (_req, res) => {
  try {
    const profile = await getProfile();
    res.json(profile);
  } catch (err) {
    console.error("Profile fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// PUT /api/admin/profile — update profile text fields (name only for now)
app.put("/api/admin/profile", authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;
    const data = {};
    if (name !== undefined) data.name = name;
    const profile = await updateProfile(data);
    res.json(profile);
  } catch (err) {
    console.error("Profile update error:", err.message);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// POST /api/admin/profile/upload-image — upload profile image
app.post("/api/admin/profile/upload-image", authenticateToken, upload.single("profileImage"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const imageUrl = `/uploads/${req.file.filename}`;
    const profile = await updateProfile({ imageUrl });
    res.json({ imageUrl: profile.imageUrl, message: "Profile image uploaded" });
  } catch (err) {
    console.error("Profile image upload error:", err.message);
    res.status(500).json({ error: "Failed to upload profile image" });
  }
});

// POST /api/admin/refresh-feeds — manually trigger RSS fetch from admin panel
app.post("/api/admin/refresh-feeds", authenticateToken, async (_req, res) => {
  try {
    const result = await refreshAllFeeds();
    if (result.success) {
      res.json({ message: "RSS feeds refreshed successfully", totalProcessed: result.totalProcessed });
    } else {
      res.status(500).json({ error: result.error || "Refresh failed" });
    }
  } catch (err) {
    console.error("Manual refresh error:", err.message);
    res.status(500).json({ error: "Failed to refresh feeds" });
  }
});

// ============================================================
//  HEALTH CHECK ENDPOINT (P0 - Monitoring)
// ============================================================
app.get("/health", async (_req, res) => {
  try {
    const dbState = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: dbState,
      uptime: process.uptime(),
    });
  } catch (err) {
    res.status(503).json({ status: "error", message: err.message });
  }
});

// Admin News API - with pagination (P1 Performance)
app.get("/api/admin/news", authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const news = await News.find()
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await News.countDocuments();

    res.json({
      news,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      }
    });
  }
  catch (err) {
    console.error("Admin News fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch Admin news" });
  }
});


// GET /api/polls/active - public, returns featured or latest active poll
app.get("/api/polls/active", async (_req, res) => {
  try {
    const poll = await Poll.findOne({ status: true, featured: true }).sort({ publishedAt: -1 })
      || await Poll.findOne({ status: true }).sort({ publishedAt: -1 });
    if (!poll) return res.status(404).json({ error: "No active poll found" });
    res.json(poll);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch active poll" });
  }
});

// POST /api/polls/:id/vote - public, submit a vote
app.post("/api/polls/:id/vote", async (req, res) => {
  try {
    const { optionId } = req.body;
    if (!optionId) return res.status(400).json({ error: "optionId is required" });
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ error: "Poll not found" });
    if (!poll.status) return res.status(400).json({ error: "Poll is closed" });
    const option = poll.options.id(optionId);
    if (!option) return res.status(404).json({ error: "Option not found" });
    option.votes += 1;
    poll.totalVotes += 1;
    await poll.save();
    res.json(poll);
  } catch (err) {
    res.status(500).json({ error: "Failed to record vote" });
  }
});
// ============================================================
//  Polls API (Admin)
// ============================================================
app.get("/api/admin/polls", authenticateToken, async (req, res) => {
  try {
    const polls = await Poll.find().sort({ publishedAt: -1, createdAt: -1 });
    res.json(polls);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch polls" });
  }
});

app.post("/api/admin/polls", authenticateToken, async (req, res) => {
  try {
    const poll = new Poll(req.body);
    await poll.save();
    res.json(poll);
  } catch (err) {
    res.status(500).json({ error: "Failed to create poll" });
  }
});

app.put("/api/admin/polls/:id", authenticateToken, async (req, res) => {
  try {
    const poll = await Poll.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(poll);
  } catch (err) {
    res.status(500).json({ error: "Failed to update poll" });
  }
});

app.delete("/api/admin/polls/:id", authenticateToken, async (req, res) => {
  try {
    await Poll.findByIdAndDelete(req.params.id);
    res.json({ message: "Poll deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete poll" });
  }
});
// --- Helpers ---

function deduplicateByTitle(articles) {
  const seen = new Set();
  return articles.filter((a) => {
    const key = a.title.toLowerCase().trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}




// Scrape og:image (or twitter:image fallback) from an article URL
async function fetchOgImage(url, timeoutMs = 8000) {
  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  ];

  const fetchWithRetry = async (targetUrl, retries = 2) => {
    for (let i = 0; i < retries; i++) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        
        const resp = await fetch(targetUrl, {
          signal: controller.signal,
          headers: {
            "User-Agent": userAgents[Math.floor(Math.random() * userAgents.length)],
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Upgrade-Insecure-Requests": "1",
          },
        });
        clearTimeout(timer);
        if (resp.ok) return await resp.text();
        if (resp.status === 403 || resp.status === 503) {
          // If blocked, wait 2 seconds and retry
          await new Promise(r => setTimeout(r, 2000));
          continue;
        }
        return null;
      } catch (err) {
        if (i === retries - 1) return null;
        await new Promise(r => setTimeout(r, 1000));
      }
    }
    return null;
  };

  try {
    let resolvedUrl = url;
    if (url.includes('news.google.com')) {
      try {
        const headResp = await fetch(url, {
          method: 'GET',
          redirect: 'follow',
          signal: AbortSignal.timeout(5000),
          headers: { 'User-Agent': userAgents[0] },
        });
        resolvedUrl = headResp.url;
      } catch {
        return null;
      }
    }

    const html = await fetchWithRetry(resolvedUrl);
    if (!html) return null;

    const patterns = [
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
      /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
      /<link[^>]+rel=["']image_src["'][^>]+href=["']([^"']+)["']/i,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        let imgUrl = match[1];
        if (imgUrl.startsWith("//")) imgUrl = "https:" + imgUrl;
        if (imgUrl.startsWith("/")) {
          const origin = new URL(resolvedUrl).origin;
          imgUrl = origin + imgUrl;
        }
        return imgUrl;
      }
    }
    return null;
  } catch {
    return null;
  }
}

const PORT = process.env.PORT || 5000;

// Connect to MongoDB, then start the server
connectDB().then(async () => {
  app.listen(PORT, () => {
    console.log(`📡 News RSS proxy running on http://localhost:${PORT}`);
  });

  // Run initial RSS fetch on startup so users see fresh news immediately
  console.log("🚀 Running initial RSS fetch on startup...");
  refreshAllFeeds();

  // ── Cron: Refresh all feeds every 15 minutes ──
  cron.schedule("*/15 * * * *", () => {
    refreshAllFeeds();
  });

  // ============================================================
  //  Breaking News Alert Cron Job (every 30 minutes)
  // ============================================================
  cron.schedule('*/30 * * * *', async () => {
    try {
      // Find breaking articles published in the last 30 minutes
      const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
      const breakingArticles = await News.find({
        breaking: true,
        publishedAt: { $gte: thirtyMinsAgo },
      }).sort({ publishedAt: -1 }).limit(10).lean();

      if (breakingArticles.length === 0) return;

      // Find users subscribed to breaking news alerts
      const subscribedUsers = await User.find({
        'notifications.breakingNews': true,
        isVerified: true,
      }).select('email name notifications.lastAlertSentAt').lean();

      if (subscribedUsers.length === 0) return;

      console.log(`🔔 Sending breaking news alerts to ${subscribedUsers.length} users for ${breakingArticles.length} articles`);

      const articleListHtml = breakingArticles.map(a => `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
            <a href="${FRONTEND_URL}/article/${a._id}" style="color: #1e293b; text-decoration: none; font-weight: 600; font-size: 15px;">${a.title}</a>
            <div style="color: #94a3b8; font-size: 12px; margin-top: 4px;">${a.source || a.category} • ${new Date(a.publishedAt).toLocaleString()}</div>
          </td>
        </tr>
      `).join('');

      for (const user of subscribedUsers) {
        try {
          await transporter.sendMail({
            from: EMAIL_USER,
            to: user.email,
            subject: `🚨 Breaking News Alert - TV19 News`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
                <h2 style="color: #e8380d; text-align: center; margin-bottom: 20px;">🚨 BREAKING NEWS</h2>
                <p style="color: #374151;">Hello ${user.name},</p>
                <p style="color: #64748b;">Here are the latest breaking news stories:</p>
                <table style="width: 100%; border-collapse: collapse;">${articleListHtml}</table>
                <div style="text-align: center; margin-top: 30px;">
                  <a href="${FRONTEND_URL}" style="background-color: #e8380d; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Read More on TV19 News</a>
                </div>
                <p style="color: #94a3b8; font-size: 12px; margin-top: 30px; text-align: center;">
                  You received this because you enabled Breaking News Alerts. 
                  <a href="${FRONTEND_URL}/login" style="color: #e8380d;">Manage preferences</a>
                </p>
              </div>
            `,
          });

          // Update lastAlertSentAt
          await User.findByIdAndUpdate(user._id, {
            'notifications.lastAlertSentAt': new Date(),
          });
        } catch (emailErr) {
          console.error(`Failed to send alert to ${user.email}:`, emailErr.message);
        }
      }
      console.log('✅ Breaking news alerts sent.');
    } catch (err) {
      console.error('❌ Breaking news cron error:', err.message);
    }
  });
});
