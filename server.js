require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// MongoDB Connection
mongoose
  .connect(
    process.env.MONGODB_URI ||
      "mongodb+srv://aswin-haridas:aswindb@cluster0.xrxru.mongodb.net/xx?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => console.log("MongoDB Atlas connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Models
const bookmarkSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const snippetSchema = new mongoose.Schema({
  title: { type: String, required: true },
  code: { type: String, required: true },
  language: { type: String, default: "javascript" },
  description: String,
  createdAt: { type: Date, default: Date.now },
});

const Bookmark = mongoose.model("Bookmark", bookmarkSchema);
const Snippet = mongoose.model("Snippet", snippetSchema);

// API Routes for Bookmarks
app.get("/api/bookmarks", async (req, res) => {
  try {
    const bookmarks = await Bookmark.find().sort({ createdAt: -1 });
    res.json(bookmarks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/bookmarks", async (req, res) => {
  try {
    const bookmark = new Bookmark(req.body);
    const savedBookmark = await bookmark.save();
    res.status(201).json(savedBookmark);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put("/api/bookmarks/:id", async (req, res) => {
  try {
    const updatedBookmark = await Bookmark.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedBookmark);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete("/api/bookmarks/:id", async (req, res) => {
  try {
    await Bookmark.findByIdAndDelete(req.params.id);
    res.json({ message: "Bookmark deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// API Routes for Snippets
app.get("/api/snippets", async (req, res) => {
  try {
    const snippets = await Snippet.find().sort({ createdAt: -1 });
    res.json(snippets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/snippets", async (req, res) => {
  try {
    const snippet = new Snippet(req.body);
    const savedSnippet = await snippet.save();
    res.status(201).json(savedSnippet);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get("/api/snippets/:id", async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id);
    if (!snippet) {
      return res.status(404).json({ message: "Snippet not found" });
    }
    res.json(snippet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/api/snippets/:id", async (req, res) => {
  try {
    const updatedSnippet = await Snippet.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedSnippet);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete("/api/snippets/:id", async (req, res) => {
  try {
    await Snippet.findByIdAndDelete(req.params.id);
    res.json({ message: "Snippet deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Serve the main HTML file for both routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/snippets", (req, res) => {
  res.sendFile(path.join(__dirname, "snippets.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
