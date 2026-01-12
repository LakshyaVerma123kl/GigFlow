require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const gigRoutes = require("./routes/gigRoutes");
const bidRoutes = require("./routes/bidRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP Server (Wraps Express)
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    // Allow connection from deployed frontend OR localhost
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
    credentials: true,
  },
});

// Store Connected Users (UserId -> SocketId)
const userSocketMap = new Map();

io.on("connection", (socket) => {
  // Get userId from frontend query
  const userId = socket.handshake.query.userId;

  if (userId) {
    userSocketMap.set(userId, socket.id);
    console.log(`Socket: User connected: ${userId}`);
  }

  socket.on("disconnect", () => {
    if (userId) {
      userSocketMap.delete(userId);
      console.log(`Socket: User disconnected: ${userId}`);
    }
  });
});

// Middleware: Make io and userSocketMap available in Controllers
app.use((req, res, next) => {
  req.io = io;
  req.userSocketMap = userSocketMap;
  next();
});

// Standard Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    // Ensure this matches the Socket.io CORS origin
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);

// Database Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("Database connection error:", err);
    process.exit(1);
  }
};

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/gigs", gigRoutes);
app.use("/api/bids", bidRoutes);

// Health Check Endpoint
app.get("/", (req, res) => {
  res.send("GigFlow API is running...");
});

// Start Server (Use server.listen for Sockets, NOT app.listen)
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
