import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';

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

// Stripe webhook must use raw body parser BEFORE any express.json middleware
app.post(
  '/api/order/stripe-webhook',
  express.raw({ type: 'application/json' }), // Use express.raw instead of bodyParser.raw
  (req, res, next) => {
    // Log the raw request details to debug
    console.log('Stripe webhook request received');
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Body type:', typeof req.body);
    console.log('Body is Buffer:', Buffer.isBuffer(req.body));
    if (Buffer.isBuffer(req.body)) {
      console.log('Body length:', req.body.length);
      console.log('Body preview:', req.body.slice(0, 100).toString());
    }
    next();
  },
  handleStripeWebhook
);
 
// PayPal webhook - use express.json() instead of bodyParser.json()
// This ensures consistent parsing with the rest of your application
app.post(
  '/api/order/paypal/webhook',
  express.json(),  // Changed from bodyParser.json
  handlePaypalWebhook
);

// Apply global middleware
app.use(cors());
app.use(express.json());

// API routes
app.use('/api/users', usersRouter);
app.use('/api/products', productsRouter);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/order', ordersRouter);

// Optional test endpoint to manually fix PayPal payments (for recovery/testing)
app.get('/api/fix-paypal-payments', async (req, res) => {
  try {
    const result = await ordersModel.updateMany(
      { paymentMethod: 'PayPal', payment: false },
      { $set: { payment: true, status: 'Paid' } }
    );
    console.log(`Updated ${result.modifiedCount} PayPal orders`);
    res.status(200).json({
      success: true,
      message: `Updated ${result.modifiedCount} PayPal orders`,
      result
    });
  } catch (err) {
    console.error('Error fixing PayPal payments:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});
 
app.get('/api/fix-stripe-payments', async (req, res) => {
  try {
    const result = await ordersModel.updateMany(
      { paymentMethod: 'Stripe', payment: false },
      { $set: { payment: true, status: 'Paid' } }
    );
    console.log(`Updated ${result.modifiedCount} Stripe orders to paid status`);
    res.status(200).json({
      success: true,
      message: `Updated ${result.modifiedCount} Stripe orders to paid status`,
      result
    });
  } catch (err) {
    console.error('Error fixing Stripe payments:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log('Stripe webhook endpoint:     /api/order/stripe-webhook');
  console.log('PayPal webhook endpoint:     /api/order/paypal/webhook');
  console.log('Manual fix PayPal endpoint:  /api/fix-paypal-payments');
  console.log('Manual fix Stripe endpoint:  /api/fix-stripe-payments');
  console.log('Cart sync endpoint:          /api/cart/sync');
  console.log('Wishlist sync endpoint:      /api/wishlist/sync');
});