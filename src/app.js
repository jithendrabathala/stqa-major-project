const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const bookRoutes = require('./routes/bookRoutes');

const app = express();

// Middlewares
app.use(cors());
// Configure Content Security Policy to allow styling and script references
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:"]
      }
    }
  })
);
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend assets
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/books', bookRoutes);

// Fallback for API 404s
app.use('/api', (req, res) => {
  res.status(404).json({ message: 'API Route Not Found' });
});

// Fallback to index.html for all other unhandled routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong on the server',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

module.exports = app;
