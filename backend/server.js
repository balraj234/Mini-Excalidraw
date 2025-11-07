// server.js
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');

const pagesRoute = require('./routes/pages');
const shapesRoute = require('./routes/shapes');

const app = express();

// ---------- Basic middleware ----------
app.use(helmet()); // basic security headers
app.use(cors());
app.use(express.json({ limit: '8mb' }));
app.use(morgan('dev'));

// ---------- API Routes ----------
app.use('/api/pages', pagesRoute);
app.use('/api/shapes', shapesRoute);

// ---------- Serve frontend (if build exists) ----------
/*
  This will look for a frontend build in:
    - ./frontend/dist   <-- Vite default
    - ./frontend/build  <-- CRA default
  Adjust if your project uses a different path.
*/
const tryPaths = [
  path.join(__dirname, 'frontend', 'dist'),
  path.join(__dirname, 'frontend', 'build')
];
const buildPath = tryPaths.find(p => fs.existsSync(p) && fs.statSync(p).isDirectory());

if (buildPath) {
  console.log('Serving static frontend from:', buildPath);

  // If you precompress assets (e.g. build/*.js.gz), respond with gz and correct headers
  app.get('*.js', (req, res, next) => {
    const gzPath = path.join(buildPath, req.path + '.gz'); // e.g. /static/js/main.js.gz
    if (fs.existsSync(gzPath)) {
      res.setHeader('Content-Encoding', 'gzip');
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      return res.sendFile(gzPath);
    }
    next();
  });

  // Let express.static handle normal files and mime types
  app.use(express.static(buildPath, {
    setHeaders: (res, filePath) => {
      // ensure proper mime types for some common extensions
      if (filePath.endsWith('.svg')) {
        res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
      } else if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      } else if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css; charset=utf-8');
      }
    }
  }));

  // SPA catch-all: serve index.html for client-side routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
} else {
  console.log('No frontend build found in frontend/dist or frontend/build. Skipping static serve.');
}

// ---------- Environment & Mongo ----------
// Ensure required env var
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('FATAL: MONGO_URI is not set in environment variables. Aborting.');
  process.exit(1);
}

const PORT = parseInt(process.env.PORT, 10) || 4000;

// Connect to MongoDB with recommended options
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('MongoDB connected successfully');

    const server = app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });

    // Graceful shutdown
    const graceful = () => {
      console.log('Shutting down gracefully...');
      server.close(() => {
        mongoose.connection.close(false, () => {
          console.log('MongoDB connection closed.');
          process.exit(0);
        });
      });
    };

    process.on('SIGTERM', graceful);
    process.on('SIGINT', graceful);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Basic health-check endpoint
app.get('/healthz', (req, res) => {
  res.json({ ok: true });
});
