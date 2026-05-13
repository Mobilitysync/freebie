import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middlewares
// Apply helmet with relaxed CSP to allow Firebase to work on the frontend if needed
app.use(helmet({
  contentSecurityPolicy: false,
}));

app.use(compression());
app.use(morgan('combined')); // Request logging

// Only allow specific origins (in this case, same origin since it's served from this backend)
// For a production app, set this to the actual domains.
// app.use(cors({ origin: 'https://your-production-domain.com' }));
app.use(cors()); // Allow all for now, but in production this should be restricted.

// Rate Limiting: Handle up to 1000+ users gracefully
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

// Secure Endpoint to provide Firebase Configuration
app.get('/api/config', apiLimiter, (req, res) => {
  // Optional: Enforce that the request comes from our own pages (Referer check)
  const referer = req.get('Referer');
  // if (!referer || !referer.includes(req.hostname)) {
  //   return res.status(403).json({ error: 'Forbidden' });
  // }

  res.json({
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID,
  });
});

// Serve static frontend files
app.use(express.static(path.join(__dirname, '.')));

// Catch-all to send to index (or 404 depending on your frontend setup)
// Express 5 requires proper regex/array pathing. Using a wildcard middleware instead:
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Secure backend server running on port ${PORT}`);
});
