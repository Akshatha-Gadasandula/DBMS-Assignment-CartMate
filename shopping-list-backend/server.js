const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const jwt = require('jsonwebtoken');

dotenv.config();
const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(cors());

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }
    req.user = user;
    next();
  });
};

// Routes
app.use("/api/auth", authRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Backend server is running!" });
});

// Item Schema
const itemSchema = new mongoose.Schema({
  name: String,
  completed: {
    type: Boolean,
    default: false
  }
});

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const List = mongoose.model("List", listSchema);

// Get all lists for the authenticated user
app.get("/lists", authenticateToken, async (req, res) => {
  try {
    const lists = await List.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(lists);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new list
app.post("/lists", authenticateToken, async (req, res) => {
  try {
    const newList = new List({
      name: req.body.name,
      items: [],
      userId: req.user.userId
    });
    await newList.save();
    res.status(201).json(newList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a list
app.delete("/lists/:listId", authenticateToken, async (req, res) => {
  try {
    const list = await List.findOne({ _id: req.params.listId, userId: req.user.userId });
    if (!list) {
      return res.status(404).json({ error: "List not found or unauthorized" });
    }
    await List.findByIdAndDelete(req.params.listId);
    res.json({ message: "List deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add item to a list
app.post("/lists/:listId/items", authenticateToken, async (req, res) => {
  try {
    const list = await List.findOne({ _id: req.params.listId, userId: req.user.userId });
    if (!list) {
      return res.status(404).json({ error: "List not found or unauthorized" });
    }

    list.items.push({ name: req.body.name });
    await list.save();
    res.status(201).json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE an item from a list
app.delete("/lists/:listId/items/:itemId", authenticateToken, async (req, res) => {
  try {
    const { listId, itemId } = req.params;
    const list = await List.findOne({ _id: listId, userId: req.user.userId });
    if (!list) {
      return res.status(404).json({ error: "List not found or unauthorized" });
    }

    list.items = list.items.filter((item) => item._id.toString() !== itemId);
    await list.save();
    res.json({ message: "Item deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle item completed
app.patch("/lists/:listId/items/:itemId/toggle", authenticateToken, async (req, res) => {
  try {
    const list = await List.findOne({ _id: req.params.listId, userId: req.user.userId });
    if (!list) {
      return res.status(404).json({ error: "List not found or unauthorized" });
    }

    const item = list.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    item.completed = !item.completed;
    await list.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
