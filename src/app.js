const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const bookRoutes = require("./routes/bookRoutes");

const app = express();

// Middlewares
app.use(cors());

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend assets
app.use(express.static(path.join(__dirname, "../public")));

// API Routes
app.use("/api/books", bookRoutes);

app.get("/api/healthz", (_req, res) => {
  res.status(200).json({ message: "Server is healthy!!! heyyy updated" });
});

// Fallback for API 404s
app.use("/api", (req, res) => {
  res.status(404).json({ message: "API Route Not Found" });
});

// Fallback to index.html for all other unhandled routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong on the server",
    error: process.env.NODE_ENV === "production" ? {} : err.message,
  });
});

module.exports = app;
