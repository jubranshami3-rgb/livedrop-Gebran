const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./db');

// Connect to database
connectDB();

const app = express();

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:3000',  // Local development
      'https://your-frontend.vercel.app',  // Your Vercel frontend
      /\.vercel\.app$/,  // Any Vercel preview deployments
    ];

    // Check if the origin is allowed
    if (allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return origin === allowed;
      }
      return allowed.test(origin);
    })) {
      return callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());

// ... rest of your routes and middleware ...

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`CORS enabled for frontend domains`);
});