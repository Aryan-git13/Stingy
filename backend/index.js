const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./database/db");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const User = require("./models/user.models.js");
const Note = require("./models/notes.models.js");
const authenticateToken = require("./utilities.js");

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// CORS
const allowedOrigins = [
  "https://mynotes-ebon.vercel.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173"
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true
  })
);

// Handle preflight requests
app.options("*", cors());

// Connect Database
connectDB();

// Test Route
app.get("/", (req, res) => {
  res.json({ message: "Backend running successfully" });
});


// ================= AUTH ROUTES =================

// Create Account
app.post("/api/notes/create-account", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        error: true,
        message: "All fields are required"
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        error: true,
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      fullName,
      email,
      password: hashedPassword
    });

    await user.save();

    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      error: false,
      message: "Account created successfully",
      accessToken
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      message: "Server error"
    });
  }
});


// Login
app.post("/api/notes/login", async (req, res) => {
  try {

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: true,
        message: "Email and password required"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        error: true,
        message: "User not found"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        error: true,
        message: "Invalid credentials"
      });
    }

    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      error: false,
      message: "Login successful",
      accessToken,
      email: user.email
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      message: "Server error"
    });
  }
});


// ================= USER ROUTE =================

app.get("/api/notes/get-user", authenticateToken, async (req, res) => {
  try {

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(401).json({
        error: true,
        message: "Unauthorized"
      });
    }

    res.json({
      user: {
        fullName: user.fullName,
        email: user.email,
        _id: user._id,
        createdOn: user.createdOn
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      message: "Server error"
    });
  }
});


// ================= NOTES =================

// Add Note
app.post("/api/notes/add-note", authenticateToken, async (req, res) => {
  try {

    const { title, content, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        error: true,
        message: "Title and Content required"
      });
    }

    const note = new Note({
      title,
      content,
      tags: tags || [],
      userId: req.user.userId
    });

    await note.save();

    res.json({
      error: false,
      note,
      message: "Note added successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      message: "Server error"
    });
  }
});


// Get All Notes
app.get("/api/notes/get-all-notes", authenticateToken, async (req, res) => {
  try {

    const notes = await Note.find({
      userId: req.user.userId
    }).sort({ isPinned: -1 });

    res.json({
      error: false,
      notes,
      message: "All notes retrieved successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      message: "Server error"
    });
  }
});


// Search Notes
app.get("/api/notes/search-notes", authenticateToken, async (req, res) => {
  try {

    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        error: true,
        message: "Query is required"
      });
    }

    const notes = await Note.find({
      userId: req.user.userId,
      $or: [
        { title: { $regex: query, $options: "i" } },
        { content: { $regex: query, $options: "i" } }
      ]
    });

    res.json({
      error: false,
      notes,
      message: "Matching notes found"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      message: "Server error"
    });
  }
});


// ================= SERVER =================

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
