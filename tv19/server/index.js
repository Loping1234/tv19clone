import "dotenv/config";
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

const parser = new Parser({
  customFields: {
    item: [
      ["media:content", "mediaContent", { keepArray: false }],
      ["media:thumbnail", "mediaThumbnail", { keepArray: false }],
      ["media:group", "mediaGroup", { keepArray: false }],
    ],
  },
});

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
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

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
  "timesofindia.indiatimes.com",
  "economictimes.indiatimes.com",
  "feeds.bbci.co.uk",
  "www.bbc.com",
  "www.thehindu.com",
  "news.google.com",
  "rss.nytimes.com",
  "www.nytimes.com",
  "indianexpress.com",
  "www.ndtv.com",
  "www.hindustantimes.com",
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

// Global error handlers to prevent silent exits
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED REJECTION:", reason);
});

// RSS feed URLs mapped by category (Times of India + BBC + supplementary)
const RSS_FEEDS = {
  // ═══════════════════════════════════════════
  //  MAIN CATEGORIES
  // ═══════════════════════════════════════════
  top: [
    "https://timesofindia.indiatimes.com/rssfeedstopstories.cms",
    "https://feeds.bbci.co.uk/news/rss.xml",
    "https://www.thehindu.com/news/feeder/default.rss",
  ],
  india: [
    "https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms",
    "https://feeds.bbci.co.uk/news/world/asia/india/rss.xml",
    "https://www.thehindu.com/news/national/feeder/default.rss",
  ],
  business: [
    "https://timesofindia.indiatimes.com/rssfeeds/1898055.cms",
    "https://feeds.bbci.co.uk/news/business/rss.xml",
    "https://economictimes.indiatimes.com/rssfeedstopstories.cms",
    "https://www.thehindu.com/business/feeder/default.rss",
  ],
  finance: [
    "https://economictimes.indiatimes.com/wealth/rssfeeds/837555174.cms",
    "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms",
    "https://news.google.com/rss/search?q=finance+India&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  markets: [
    "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms",
    "https://economictimes.indiatimes.com/markets/stocks/rssfeeds/2146842.cms",
  ],
  entertainment: [
    "https://timesofindia.indiatimes.com/rssfeeds/1081479906.cms",
    "https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml",
    "https://www.thehindu.com/entertainment/feeder/default.rss",
  ],
  health: [
    "https://timesofindia.indiatimes.com/rssfeeds/3908999.cms",
    "https://feeds.bbci.co.uk/news/health/rss.xml",
    "https://www.thehindu.com/sci-tech/health/feeder/default.rss",
  ],
  science: [
    "https://timesofindia.indiatimes.com/rssfeeds/4719161.cms",
    "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml",
    "https://www.thehindu.com/sci-tech/science/feeder/default.rss",
  ],
  sports: [
    "https://timesofindia.indiatimes.com/rssfeeds/4719148.cms",
    "https://feeds.bbci.co.uk/sport/rss.xml",
    "https://www.thehindu.com/sport/feeder/default.rss",
  ],
  technology: [
    "https://timesofindia.indiatimes.com/rssfeeds/66949542.cms",
    "https://feeds.bbci.co.uk/news/technology/rss.xml",
    "https://www.thehindu.com/sci-tech/technology/feeder/default.rss",
  ],
  world: [
    "https://timesofindia.indiatimes.com/rssfeeds/296589292.cms",
    "https://feeds.bbci.co.uk/news/world/rss.xml",
    "https://www.thehindu.com/news/international/feeder/default.rss",
  ],
  politics: [
    "https://timesofindia.indiatimes.com/rssfeeds/7503091.cms",
    "https://feeds.bbci.co.uk/news/politics/rss.xml",
    "https://www.thehindu.com/news/national/feeder/default.rss",
    "https://news.google.com/rss/search?q=India+politics+news&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  environment: [
    "https://timesofindia.indiatimes.com/rssfeeds/2647163.cms",
    "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml",
  ],
  lifestyle: [
    "https://timesofindia.indiatimes.com/rssfeeds/2886704.cms",
    "https://feeds.bbci.co.uk/news/magazine/rss.xml",
    "https://www.thehindu.com/life-and-style/feeder/default.rss",
  ],
  education: [
    "https://timesofindia.indiatimes.com/rssfeeds/913168846.cms",
    "https://feeds.bbci.co.uk/news/education/rss.xml",
    "https://www.thehindu.com/education/feeder/default.rss",
  ],
  crime: [
    "https://news.google.com/rss/search?q=crime+news+india&hl=en-IN&gl=IN&ceid=IN:en",
    "https://timesofindia.indiatimes.com/rssfeeds/2950623.cms",
  ],
  astrology: [
    "https://timesofindia.indiatimes.com/rssfeeds/6547154.cms",
    "https://news.google.com/rss/search?q=horoscope+astrology+India&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  opinion: [
    "https://timesofindia.indiatimes.com/rssfeeds/784865811.cms",
    "https://www.thehindu.com/opinion/feeder/default.rss",
  ],
  art: [
    "https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml",
    "https://www.thehindu.com/entertainment/art/feeder/default.rss",
    "https://news.google.com/rss/search?q=art+culture+India&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  weather: [
    "https://news.google.com/rss/search?q=weather+India+forecast&hl=en-IN&gl=IN&ceid=IN:en",
    "https://news.google.com/rss/search?q=IMD+weather+alert&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  // key uses hyphen to match frontend route /green-future
  "green-future": [
    "https://news.google.com/rss/search?q=green+energy+sustainability+india&hl=en-IN&gl=IN&ceid=IN:en",
    "https://news.google.com/rss/search?q=renewable+energy+India&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  trending: [
    "https://timesofindia.indiatimes.com/rssfeedstopstories.cms",
    "https://feeds.bbci.co.uk/news/rss.xml",
    "https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en",
  ],
  manufacturing: [
    "https://news.google.com/rss/search?q=manufacturing+industry+india&hl=en-IN&gl=IN&ceid=IN:en",
    "https://economictimes.indiatimes.com/industry/indl-goods/svs/rssfeeds/13352651.cms",
  ],

  // ═══════════════════════════════════════════
  //  INDIAN STATES
  // ═══════════════════════════════════════════
  "rajasthan": [
    "https://news.google.com/rss/search?q=Rajasthan+news&hl=en-IN&gl=IN&ceid=IN:en",
    "https://timesofindia.indiatimes.com/rssfeeds/2148496.cms",
  ],
  "uttar pradesh": [
    "https://news.google.com/rss/search?q=Uttar+Pradesh+news&hl=en-IN&gl=IN&ceid=IN:en",
    "https://timesofindia.indiatimes.com/rssfeeds/3947060.cms",
  ],
  "maharashtra": [
    "https://news.google.com/rss/search?q=Maharashtra+news&hl=en-IN&gl=IN&ceid=IN:en",
    "https://timesofindia.indiatimes.com/rssfeeds/-2128817995.cms",
  ],
  "madhya pradesh": [
    "https://news.google.com/rss/search?q=Madhya+Pradesh+news&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  "gujarat": [
    "https://news.google.com/rss/search?q=Gujarat+news&hl=en-IN&gl=IN&ceid=IN:en",
    "https://timesofindia.indiatimes.com/rssfeeds/4021545.cms",
  ],
  "bihar": [
    "https://news.google.com/rss/search?q=Bihar+news&hl=en-IN&gl=IN&ceid=IN:en",
    "https://timesofindia.indiatimes.com/rssfeeds/2128929.cms",
  ],
  "west bengal": [
    "https://news.google.com/rss/search?q=West+Bengal+news&hl=en-IN&gl=IN&ceid=IN:en",
    "https://timesofindia.indiatimes.com/rssfeeds/4118235.cms",
  ],
  "karnataka": [
    "https://news.google.com/rss/search?q=Karnataka+news&hl=en-IN&gl=IN&ceid=IN:en",
    "https://timesofindia.indiatimes.com/rssfeeds/-2128816011.cms",
  ],
  "tamil nadu": [
    "https://news.google.com/rss/search?q=Tamil+Nadu+news&hl=en-IN&gl=IN&ceid=IN:en",
    "https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms",
  ],
  "andhra pradesh": [
    "https://news.google.com/rss/search?q=Andhra+Pradesh+news&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  "telangana": [
    "https://news.google.com/rss/search?q=Telangana+news&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  "kerala": [
    "https://news.google.com/rss/search?q=Kerala+news&hl=en-IN&gl=IN&ceid=IN:en",
    "https://www.thehindu.com/news/national/kerala/feeder/default.rss",
  ],
  "punjab": [
    "https://news.google.com/rss/search?q=Punjab+news+India&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  "haryana": [
    "https://news.google.com/rss/search?q=Haryana+news&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  "jharkhand": [
    "https://news.google.com/rss/search?q=Jharkhand+news&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  "odisha": [
    "https://news.google.com/rss/search?q=Odisha+news&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  "chhattisgarh": [
    "https://news.google.com/rss/search?q=Chhattisgarh+news&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  "uttarakhand": [
    "https://news.google.com/rss/search?q=Uttarakhand+news&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  "himachal pradesh": [
    "https://news.google.com/rss/search?q=Himachal+Pradesh+news&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  "assam": [
    "https://news.google.com/rss/search?q=Assam+news&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  "goa": [
    "https://news.google.com/rss/search?q=Goa+news&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  "manipur": [
    "https://news.google.com/rss/search?q=Manipur+news&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  "meghalaya": [
    "https://news.google.com/rss/search?q=Meghalaya+news&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  "mizoram": [
    "https://news.google.com/rss/search?q=Mizoram+news&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  "nagaland": [
    "https://news.google.com/rss/search?q=Nagaland+news&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  "tripura": [
    "https://news.google.com/rss/search?q=Tripura+news&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  "arunachal pradesh": [
    "https://news.google.com/rss/search?q=Arunachal+Pradesh+news&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  "sikkim": [
    "https://news.google.com/rss/search?q=Sikkim+news&hl=en-IN&gl=IN&ceid=IN:en",
  ],

  // ═══════════════════════════════════════════
  //  UNION TERRITORIES
  // ═══════════════════════════════════════════
  "delhi": [
    "https://news.google.com/rss/search?q=Delhi+news&hl=en-IN&gl=IN&ceid=IN:en",
    "https://timesofindia.indiatimes.com/rssfeeds/2148496.cms",
    "https://www.thehindu.com/news/cities/Delhi/feeder/default.rss",
  ],
  "jammu kashmir": [
    "https://news.google.com/rss/search?q=Jammu+Kashmir+news&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  "ladakh": [
    "https://news.google.com/rss/search?q=Ladakh+news&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  "puducherry": [
    "https://news.google.com/rss/search?q=Puducherry+news&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  "chandigarh": [
    "https://news.google.com/rss/search?q=Chandigarh+news&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  "andaman nicobar": [
    "https://news.google.com/rss/search?q=Andaman+Nicobar+news&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  "lakshadweep": [
    "https://news.google.com/rss/search?q=Lakshadweep+news&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  "dadra daman diu": [
    "https://news.google.com/rss/search?q=Dadra+Nagar+Haveli+Daman+Diu+news&hl=en-IN&gl=IN&ceid=IN:en",
  ],

  // ═══════════════════════════════════════════
  //  RAJASTHAN CITY-SPECIFIC FEEDS
  // ═══════════════════════════════════════════
  "ajmer": [
    "https://news.google.com/rss/search?q=Ajmer+news&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  "alwar": [
    "https://news.google.com/rss/search?q=Alwar+Rajasthan+news&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  "bagru": [
    "https://news.google.com/rss/search?q=Bagru+Jaipur+news&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  "banswara": [
    "https://news.google.com/rss/search?q=Banswara+Rajasthan+news&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  "barmer": [
    "https://news.google.com/rss/search?q=Barmer+Rajasthan+news&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  "bassi": [
    "https://news.google.com/rss/search?q=Bassi+Jaipur+news&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  "beawer": [
    "https://news.google.com/rss/search?q=Beawar+Rajasthan+news&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  "bharatpur": [
    "https://news.google.com/rss/search?q=Bharatpur+Rajasthan+news&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  "bhilwara": [
    "https://news.google.com/rss/search?q=Bhilwara+Rajasthan+news&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  "bhiwadi": [
    "https://news.google.com/rss/search?q=Bhiwadi+Rajasthan+news&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  "bikaner": [
    "https://news.google.com/rss/search?q=Bikaner+Rajasthan+news&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  "chittorgarh": [
    "https://news.google.com/rss/search?q=Chittorgarh+Rajasthan+news&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  "churu": [
    "https://news.google.com/rss/search?q=Churu+Rajasthan+news&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  "dausa": [
    "https://news.google.com/rss/search?q=Dausa+Rajasthan+news&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  "dholpur": [
    "https://news.google.com/rss/search?q=Dholpur+Rajasthan+news&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  "dungarpur": [
    "https://news.google.com/rss/search?q=Dungarpur+Rajasthan+news&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  "hanumangarh": [
    "https://news.google.com/rss/search?q=Hanumangarh+Rajasthan+news&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  "jaipur": [
    "https://news.google.com/rss/search?q=Jaipur+news&hl=en-IN&gl=IN&ceid=IN:en",
    "https://timesofindia.indiatimes.com/rssfeeds/2148496.cms",
  ],
  "jaisalmer": [
    "https://news.google.com/rss/search?q=Jaisalmer+Rajasthan+news&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  "jalore": [
    "https://news.google.com/rss/search?q=Jalore+Rajasthan+news&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  "jhalawar": [
    "https://news.google.com/rss/search?q=Jhalawar+Rajasthan+news&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  "jhunjhunu": [
    "https://news.google.com/rss/search?q=Jhunjhunu+Rajasthan+news&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  "jodhpur": [
    "https://news.google.com/rss/search?q=Jodhpur+news&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  "karauli": [
    "https://news.google.com/rss/search?q=Karauli+Rajasthan+news&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  "kishangarh": [
    "https://news.google.com/rss/search?q=Kishangarh+Rajasthan+news&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  "kota": [
    "https://news.google.com/rss/search?q=Kota+Rajasthan+news&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  "nagaur": [
    "https://news.google.com/rss/search?q=Nagaur+Rajasthan+news&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  "pali": [
    "https://news.google.com/rss/search?q=Pali+Rajasthan+news&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  "pratapgarh": [
    "https://news.google.com/rss/search?q=Pratapgarh+Rajasthan+news&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  "rajsamand": [
    "https://news.google.com/rss/search?q=Rajsamand+Rajasthan+news&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  "sawai madhopur": [
    "https://news.google.com/rss/search?q=Sawai+Madhopur+Rajasthan+news&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  "sikar": [
    "https://news.google.com/rss/search?q=Sikar+Rajasthan+news&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  "sirohi": [
    "https://news.google.com/rss/search?q=Sirohi+Rajasthan+news&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  "sri ganganagar": [
    "https://news.google.com/rss/search?q=Sri+Ganganagar+Rajasthan+news&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  "tonk": [
    "https://news.google.com/rss/search?q=Tonk+Rajasthan+news&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  "udaipur": [
    "https://news.google.com/rss/search?q=Udaipur+Rajasthan+news&hl=en-IN&gl=IN&ceid=IN:en",
  ],

  // ═══════════════════════════════════════════
  //  WORLD REGIONS
  // ═══════════════════════════════════════════
  "africa": [
    "https://news.google.com/rss/search?q=Africa+news&hl=en-IN&gl=IN&ceid=IN:en",
    "https://feeds.bbci.co.uk/news/world/africa/rss.xml",
  ],
  "america": [
    "https://news.google.com/rss/search?q=America+news&hl=en-IN&gl=IN&ceid=IN:en",
    "https://feeds.bbci.co.uk/news/world/us_and_canada/rss.xml",
    "https://rss.nytimes.com/services/xml/rss/nyt/Americas.xml",
  ],
  "asia pacific": [
    "https://news.google.com/rss/search?q=Asia+Pacific+news&hl=en-IN&gl=IN&ceid=IN:en",
    "https://feeds.bbci.co.uk/news/world/asia/rss.xml",
  ],
  "europe": [
    "https://news.google.com/rss/search?q=Europe+news&hl=en-IN&gl=IN&ceid=IN:en",
    "https://feeds.bbci.co.uk/news/world/europe/rss.xml",
    "https://rss.nytimes.com/services/xml/rss/nyt/Europe.xml",
  ],
  "middle east": [
    "https://news.google.com/rss/search?q=Middle+East+news&hl=en-IN&gl=IN&ceid=IN:en",
    "https://feeds.bbci.co.uk/news/world/middle_east/rss.xml",
    "https://rss.nytimes.com/services/xml/rss/nyt/MiddleEast.xml",
  ],
  "new york": [
    "https://news.google.com/rss/search?q=New+York+news&hl=en-IN&gl=IN&ceid=IN:en",
    "https://rss.nytimes.com/services/xml/rss/nyt/NYRegion.xml",
  ],
  "pakistan": [
    "https://news.google.com/rss/search?q=Pakistan+news&hl=en-IN&gl=IN&ceid=IN:en",
    "https://feeds.bbci.co.uk/news/world/south_asia/rss.xml",
  ],
  "uk": [
    "https://news.google.com/rss/search?q=UK+United+Kingdom+news&hl=en-IN&gl=IN&ceid=IN:en",
    "https://feeds.bbci.co.uk/news/uk/rss.xml",
  ],
  "us": [
    "https://news.google.com/rss/search?q=United+States+news&hl=en-IN&gl=IN&ceid=IN:en",
    "https://feeds.bbci.co.uk/news/world/us_and_canada/rss.xml",
    "https://rss.nytimes.com/services/xml/rss/nyt/US.xml",
  ],
};

// Images that are known to be generic/broken and should be skipped
const GENERIC_IMAGE_PATTERNS = [
  "imgsize-.cms",
  "toiedit-logo",
  "toilogo",
  "toiblogs/photo/blogs/wp-content/uploads/2019/01/toiedit-logo",
  "toiblogs/photo/blogs/wp-content/uploads/2014/07/toilogo",
  "placeholder",
  "default-image",
  "no-image",
  "noimage",
];

// Map a single RSS item → normalized article object
function mapItem(item, feedTitle) {
  let image = extractImage(item);

  // Reject known bad/generic images
  if (image && GENERIC_IMAGE_PATTERNS.some((pat) => image.includes(pat))) {
    image = null;
  }

  // Strip Google News title suffix "Headline - Source"
  let title = item.title || "";
  let source = feedTitle || "Unknown";
  const dashIdx = title.lastIndexOf(" - ");
  if (feedTitle === "Google News" && dashIdx > 0) {
    source = title.substring(dashIdx + 3).trim();
    title = title.substring(0, dashIdx).trim();
  }

  return {
    source,
    author: item.creator || item["dc:creator"] || null,
    title,
    description: item.contentSnippet || item.content || null,
    url: item.link || "",
    image,
    publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
    content: item.content || null,
  };
}

// Fetch and parse multiple feed URLs, return merged articles array
async function fetchFeeds(feedUrls, label) {
  const results = await Promise.allSettled(
    feedUrls.map((url) => parser.parseURL(url))
  );

  const articles = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      const feed = result.value;
      articles.push(...feed.items.map((item) => mapItem(item, feed.title)));
    } else if (label) {
      console.warn(`Feed fetch failed [${label}]:`, result.reason?.message);
    }
  }
  return articles;
}

// GET /api/news?category=top&size=10&imagesOnly=true
app.get("/api/news", async (req, res) => {
  try {
    const categoryQuery = (req.query.category || "top").toString().toLowerCase();
    const size = Math.min(Math.max(parseInt(req.query.size) || 20, 1), 50);
    const skip = Math.max(parseInt(req.query.skip) || 0, 0);
    const imagesOnly = req.query.imagesOnly === "true";

    const cacheKey = `${categoryQuery}:${size}:${skip}:${imagesOnly}`;
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

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

    const result = { totalResults: articles.length, articles };
    setCache(cacheKey, result);
    res.json(result);
  } catch (err) {
    console.error("News fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch news from database" });
  }
});

// GET /api/news/state?state=Rajasthan&size=15&skip=0
app.get("/api/news/state", async (req, res) => {
  try {
    const stateName = (req.query.state || req.query.category || "Rajasthan").toString().trim();
    const size = Math.min(Math.max(parseInt(req.query.size) || 15, 1), 50);
    const skip = Math.max(parseInt(req.query.skip) || 0, 0);
    const categoryKey = stateName.toLowerCase();

    if (!stateName) {
      return res.status(400).json({ error: "Query parameter 'state' is required" });
    }

    // Tier 1: Look in MongoDB for articles under this city's category
    let articles = await News.find({ 
      status: true, 
      category: categoryKey 
    })
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(size);

    let needsRefresh = false;
    if (skip === 0) {
      if (articles.length < 5) {
        needsRefresh = true;
      } else if (articles.length > 0) {
        // Sort first before checking staleness so articles[0] is actually the latest
        const sorted = [...articles].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
        const latestArticleDate = new Date(sorted[0].publishedAt || sorted[0].createdAt);
        const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
        if (latestArticleDate < fourHoursAgo) {
          needsRefresh = true;
        }
      }
    }

    if (articles.length > 0 && !needsRefresh) {
      articles = sortArticlesForCover(articles);
    }

    // Tier 2: Live fetch from Google News RSS for this city
    let tier2Executed = false;
    if (needsRefresh && skip === 0) {
      const liveUrls = RSS_FEEDS[categoryKey] || [
        `https://news.google.com/rss/search?q=${encodeURIComponent(stateName + " news")}&hl=en-IN&gl=IN&ceid=IN:en`
      ];

      try {
        const mapped = deduplicateByTitle(await fetchFeeds(liveUrls, categoryKey));
        const prioritizedMapped = sortArticlesForCover(mapped).slice(0, size * 3);

        // Map and bulk fire the MongoDB Upserts for TEXT immediately so the user doesn't wait
        const saveOps = prioritizedMapped.map(article => 
          News.findOneAndUpdate(
            { url: article.url },
            {
              $set: {
                title: article.title,
                description: article.description,
                image: article.image, // Could be null, perfectly fine
                source: article.source,
                category: categoryKey,
                publishedAt: article.publishedAt,
                content: article.content,
              },
              $setOnInsert: { status: true } // Must be true so they appear natively on next page view
            },
            { upsert: true }
          )
        );
        await Promise.allSettled(saveOps);

        // Return the prioritised mapped articles immediately for the first load
        articles = prioritizedMapped.slice(0, size);
        tier2Executed = true;

      } catch (feedErr) {
        console.warn(`Live RSS fetch failed for ${stateName}:`, feedErr.message);
      }
    }

    // Tier 3: Strict text search — fallback (Only if no articles found natively AND Tier 2 didn't yield anything)
    if (articles.length === 0 && !tier2Executed && skip === 0) {
      articles = await News.find({
        status: true,
        $or: [
          { title: { $regex: stateName, $options: "i" } },
          { description: { $regex: stateName, $options: "i" } },
        ]
      })
        .sort({ publishedAt: -1 })
        .limit(size);

      if (articles.length > 0) {
        articles = sortArticlesForCover(articles);
      }
    }

    // Return the subset of articles found
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

    // SSRF protection: only allow known news domains
    if (!isAllowedUrl(articleUrl)) {
      return res.status(400).json({ error: "URL not allowed" });
    }

    const scrapedImage = await fetchOgImage(articleUrl);

    if (scrapedImage && scrapedImage !== brokenImage && !GENERIC_IMAGE_PATTERNS.some(pat => scrapedImage.includes(pat))) {
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
// MUST be before /:id to avoid Express matching "categories" as an id param
app.get("/api/news/categories", (_req, res) => {
  res.json({ categories: Object.keys(RSS_FEEDS) });
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

function sortArticlesForCover(articles) {
  return [...articles].sort((left, right) => {
    const leftHasImage = Boolean(left.image);
    const rightHasImage = Boolean(right.image);

    if (leftHasImage !== rightHasImage) {
      return Number(rightHasImage) - Number(leftHasImage);
    }

    return new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime();
  });
}



// Scrape og:image (or twitter:image fallback) from an article URL
async function fetchOgImage(url, timeoutMs = 6000) {
  try {
    // Follow Google News redirects by doing a HEAD request first
    let resolvedUrl = url;
    if (url.includes('news.google.com')) {
      try {
        const headResp = await fetch(url, {
          method: 'GET',
          redirect: 'follow',
          signal: AbortSignal.timeout(3000),
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)' },
        });
        resolvedUrl = headResp.url; // Get the final redirected URL
      } catch {
        return null; // Google News redirect failed, skip
      }
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const resp = await fetch(resolvedUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
    });
    clearTimeout(timer);
    if (!resp.ok) return null;

    const reader = resp.body.getReader();
    let html = "";
    let done = false;
    while (!done && html.length < 10000) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) html += new TextDecoder().decode(value);
    }
    reader.cancel().catch(() => {});

    const match =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i) ||
      html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i);

    return match ? match[1] : null;
  } catch {
    return null;
  }
}

// Extract image from RSS item fields — prioritises native RSS image fields.
// Only falls back to inline HTML img as last resort. Never does network calls.
function extractImage(item) {
  // 1. media:thumbnail (BBC, TOI — highest quality, always prefer)
  if (item.mediaThumbnail?.$?.url) return item.mediaThumbnail.$.url;
  if (item["media:thumbnail"]?.$?.url) return item["media:thumbnail"].$.url;

  // 2. media:group > media:thumbnail (YouTube-style feeds)
  if (item.mediaGroup?.["media:thumbnail"]?.[0]?.$?.url)
    return item.mediaGroup["media:thumbnail"][0].$.url;

  // 3. media:content with type image
  const mc = item.mediaContent || item["media:content"];
  if (mc?.$?.url) {
    const type = mc.$?.type || "";
    if (!type || type.startsWith("image")) return mc.$.url;
  }

  // 4. enclosure (podcast-style image attachments)
  if (item.enclosure?.url && item.enclosure.type?.startsWith("image"))
    return item.enclosure.url;

  // 5. Inline <img> in content:encoded — last resort, no network call needed
  const html = item["content:encoded"] || item.content || "";
  const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch) return imgMatch[1];

  return null;
}

// Background worker: Scrape og:images for articles missing images.
// Only runs for articles where RSS itself provided no image.
// Capped at MAX_SCRAPE_PER_RUN to prevent OOM on large batches.
// Uses SSRF-safe isAllowedUrl check before any network call.
const MAX_SCRAPE_PER_RUN = 50;
async function enrichAndSaveRemainingImages(articles) {
  const missingImages = articles
    .filter(a => !a.image && a.url && isAllowedUrl(a.url))
    .slice(0, MAX_SCRAPE_PER_RUN);
  if (missingImages.length === 0) return;

  console.log(`🖼️ Processing ${missingImages.length} missing images in background...`);

  const BATCH_SIZE = 3;
  for (let i = 0; i < missingImages.length; i += BATCH_SIZE) {
    const batch = missingImages.slice(i, i + BATCH_SIZE);

    await Promise.allSettled(batch.map(async (article) => {
      const ogImage = await fetchOgImage(article.url);
      if (ogImage && !GENERIC_IMAGE_PATTERNS.some(pat => ogImage.includes(pat))) {
        article.image = ogImage;
        await News.updateOne(
          { url: article.url },
          { $set: { image: ogImage } }
        );
      }
    }));

    if (i + BATCH_SIZE < missingImages.length) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  console.log('✅ Background image enrichment complete.');
}

// Reusable function: Fetch all active RSS feeds and save/overwrite to MongoDB
async function refreshAllFeeds() {
  console.log('🔄 Starting RSS fetch job...');
  try {
    let totalProcessed = 0;
    const allArticlesAcrossCategories = [];

    // Read active feeds from MongoDB
    const feeds = await RssFeed.find({ status: true });
    const feedCategories = {};
    for (const feed of feeds) {
      if (!feedCategories[feed.category]) feedCategories[feed.category] = [];
      feedCategories[feed.category].push(feed.url);
    }

    // Phase 1: FAST FETCH -> Fetch all categories in parallel batches of 5
    const categoryEntries = Object.entries(feedCategories);
    const FETCH_BATCH = 5;

    async function fetchAndSaveCategory(category, feedUrls) {
      console.log(`📡 Fetching category: ${category}...`);
      const articles = deduplicateByTitle(await fetchFeeds(feedUrls, category));

      const saveOps = articles.map(article =>
        News.findOneAndUpdate(
          { url: article.url },
          {
            $set: {
              title: article.title,
              description: article.description,
              // Only update image if RSS provided one — never overwrite a good image with null
              ...(article.image ? { image: article.image } : {}),
              source: article.source,
              category,
              publishedAt: article.publishedAt,
              content: article.content,
            },
            $setOnInsert: { status: false },
          },
          { upsert: true }
        )
      );

      await Promise.allSettled(saveOps);
      invalidateCache(category);
      return articles;
    }

    for (let i = 0; i < categoryEntries.length; i += FETCH_BATCH) {
      const batch = categoryEntries.slice(i, i + FETCH_BATCH);
      const results = await Promise.allSettled(
        batch.map(([category, feedUrls]) => fetchAndSaveCategory(category, feedUrls))
      );
      for (const r of results) {
        if (r.status === "fulfilled") {
          totalProcessed += r.value.length;
          allArticlesAcrossCategories.push(...r.value);
        }
      }
    }
    
    // Phase 2: BACKGROUND PASSIVE SCRAPE -> Retrieve images missing from text payload.
    // Done entirely asynchronously in chunks to prevent Node execution lag from blocking other DB events.
    if (allArticlesAcrossCategories.length > 0) {
      console.log(`🖼️ Launching background image scraping core on ${allArticlesAcrossCategories.length} items...`);
      enrichAndSaveRemainingImages(allArticlesAcrossCategories).catch(console.error);
    }

    // Update last fetch timestamp in SiteConfig
    await updateConfig({ lastRssFetchAt: new Date() });

    console.log(`✅ RSS fetch complete. Processed ${totalProcessed} articles.`);
    return { success: true, totalProcessed };
  } catch (error) {
    console.error('❌ Error during RSS fetch:', error);
    return { success: false, error: error.message };
  }
}

// Background Job: Fetch all feeds every 30 minutes
cron.schedule('*/30 * * * *', () => {
  refreshAllFeeds();
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB, then start the server
connectDB().then(async () => {
  // Seed initial RSS Feeds if empty or when new feed URLs are added
  try {
    const count = await RssFeed.countDocuments();
    const expectedCount = Object.values(RSS_FEEDS).reduce((sum, urls) => sum + urls.length, 0);

    if (count < expectedCount) {
      console.log('🌱 New feeds detected, re-seeding RSS Feeds...');

      // Insert only feeds that do not already exist
      for (const [category, urls] of Object.entries(RSS_FEEDS)) {
        for (const url of urls) {
          await RssFeed.findOneAndUpdate(
            { url },
            { url, category, status: true },
            { upsert: true }
          );
        }
      }

      console.log('✅ RSS feeds synced.');
    }
  } catch (e) {
    console.error('❌ Failed to seed RSS feeds:', e);
  }

  app.listen(PORT, () => {
    console.log(`📡 News RSS proxy running on http://localhost:${PORT}`);
  });

  // Run initial RSS fetch on startup so MongoDB has fresh data immediately
  console.log('🚀 Running initial RSS fetch on startup...');
  refreshAllFeeds();
});
