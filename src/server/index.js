import express from 'express';
import cors from 'cors';
import bookingRouter from './api/booking';
import { createServer } from 'http';

const app = express();
let port = 3001;

// Configure CORS
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['POST', 'GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept'],
}));

// Middleware
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'BD Networking API Server',
    endpoints: {
      '/': 'API information',
      '/health': 'Server health check',
      '/api/create-booking': 'Create a new booking (POST)'
    }
  });
});

// API routes
app.use('/api', bookingRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.url}`
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

function startServer(retryCount = 0) {
  const server = createServer(app);
  
  server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.log(`Port ${port} is in use, trying port ${port + 1}...`);
      port++;
      if (retryCount < 3) {
        startServer(retryCount + 1);
      } else {
        console.error('Could not find an available port. Please check running processes.');
        process.exit(1);
      }
    } else {
      console.error('Server error:', error);
      process.exit(1);
    }
  });

  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    server.close(() => {
      console.log('Server shutting down');
      process.exit(0);
    });
  });

  return server;
}

startServer();