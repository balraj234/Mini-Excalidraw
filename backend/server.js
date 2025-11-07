// Load the environment variables from .env
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

// Import routes
const pagesRoute = require('./routes/pages');
const shapesRoute = require('./routes/shapes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(morgan('dev'));

// Routes
app.use('/api/pages', pagesRoute);
app.use('/api/shapes', shapesRoute);

// Environment variables
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;

// Debug log (optional - helps verify .env is loaded)
console.log(" MONGO_URI:", MONGO_URI ? "Loaded successfully" : " Not found in .env");

// MongoDB Connection
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    app.listen(PORT, () => console.log(` Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error(' MongoDB connection error:', err.message);
    process.exit(1);
  });
