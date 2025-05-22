import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinaryImg.js';

import usersRouter from './Routes/usersRoute.js';
import productsRouter from './Routes/productsRoute.js';
import wishlistRoutes from './Routes/wishlistRoute.js';
import cartRoutes from './Routes/cartRoutes.js';
import ordersRouter from './Routes/ordersRoute.js';

import {
  handleStripeWebhook,
  handlePaypalWebhook
} from './controllers/ordersController.js';

import ordersModel from './Models/ordersModel.js';

dotenv.config();
const app = express();
const port = process.env.PORT || 4000;

// Connect to services
connectDB();
connectCloudinary();

// CRITICAL: Stripe webhook route MUST be before express.json middleware
// This endpoint needs raw body data to verify webhook signatures
app.post(
  '/api/order/stripe-webhook',
  express.raw({ type: 'application/json' }),
  async (req, res, next) => {
    console.log(' Stripe Webhook Middleware Hit');
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Stripe-Signature:', req.headers['stripe-signature'] ? 'Present' : 'Missing');
    console.log('Body is Buffer:', Buffer.isBuffer(req.body));
    console.log('Body length:', req.body?.length);
    
    if (Buffer.isBuffer(req.body)) {
      console.log('Raw body preview:', req.body.slice(0, 100).toString());
    }
    
    next();
  },
  handleStripeWebhook
);

// PayPal webhook - can use express.json
app.post('/api/order/paypal/webhook', express.json(), handlePaypalWebhook);

//  FIXED: Updated CORS configuration to include port 5174
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : [
        'http://localhost:3000',
        'http://localhost:5173', 
        'http://localhost:5174', 
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174'
      ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Add preflight handling for complex requests
app.options('*', cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Add request logging middleware for debugging
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  }
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: port
  });
});

// Test endpoint for admin authentication
app.get('/api/test-admin', (req, res) => {
  res.json({
    message: 'Admin endpoint is accessible',
    adminEmail: process.env.ADMIN_MAIL ? 'Configured' : 'Missing',
    adminPassword: process.env.ADMIN_PASSWORD ? 'Configured' : 'Missing',
    jwtCode: process.env.JWT_CODE ? 'Configured' : 'Missing'
  });
});

// API Routes
app.use('/api/users', usersRouter);
app.use('/api/products', productsRouter);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/order', ordersRouter);

// Utility endpoints for manual payment fixes (for testing/debugging)
app.get('/api/fix-paypal-payments', async (req, res) => {
  try {
    const result = await ordersModel.updateMany(
      { paymentMethod: 'PayPal', payment: false },
      { $set: { payment: true, status: 'Paid' } }
    );
    res.status(200).json({
      success: true,
      message: `Updated ${result.modifiedCount} PayPal orders`,
      result
    });
  } catch (err) {
    console.error('Fix PayPal payments error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/fix-stripe-payments', async (req, res) => {
  try {
    const result = await ordersModel.updateMany(
      { paymentMethod: 'Stripe', payment: false },
      { $set: { payment: true, status: 'Paid' } }
    );
    res.status(200).json({
      success: true,
      message: `Updated ${result.modifiedCount} Stripe orders`,
      result
    });
  } catch (err) {
    console.error('Fix Stripe payments error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Test endpoint to verify webhook setup
app.get('/api/test-stripe-webhook', (req, res) => {
  res.json({
    message: 'Stripe webhook endpoint is configured',
    endpoint: '/api/order/stripe-webhook',
    environment: process.env.NODE_ENV,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ? 'Configured' : 'Missing'
  });
});

// Catch-all error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `Route ${req.originalUrl} not found` 
  });
});

// Start server
app.listen(port, () => {
  console.log(` Server running on port ${port}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(` CORS enabled for development ports: 3000, 5173, 5174`);
  console.log(' Available endpoints:');
  console.log('  Health check:      /health');
  console.log('  Admin test:        /api/test-admin');
  console.log('  Admin login:       /api/users/admin');
  console.log('  Stripe webhook:    /api/order/stripe-webhook');
  console.log('  PayPal webhook:    /api/order/paypal/webhook');
  console.log('  Fix PayPal:        /api/fix-paypal-payments');
  console.log('  Fix Stripe:        /api/fix-stripe-payments');
  console.log('  Test webhook:      /api/test-stripe-webhook');
  console.log('  Cart sync:         /api/cart/sync');
  console.log('  Wishlist sync:     /api/wishlist/sync');
  
  // Environment variables check
  console.log('\n Environment Check:');
  console.log('  MongoDB URL:', process.env.MONGODB_URL ? ' Configured' : ' Missing');
  console.log('  Admin Email:', process.env.ADMIN_MAIL ? ' Configured' : ' Missing');
  console.log('  Admin Password:', process.env.ADMIN_PASSWORD ? ' Configured' : ' Missing');
  console.log('  JWT Code:', process.env.JWT_CODE ? ' Configured' : ' Missing');
  
  // Environment-specific warnings
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.warn('  WARNING: STRIPE_WEBHOOK_SECRET not set in production!');
    }
  }
  
  
});