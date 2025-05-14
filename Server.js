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

// Stripe webhook route - must be before express.json middleware
app.post(
  '/api/order/stripe-webhook',
  express.raw({ type: 'application/json' }),
  (req, res, next) => {
    console.log('Stripe webhook request received');
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Body is Buffer:', Buffer.isBuffer(req.body));
    if (Buffer.isBuffer(req.body)) {
      console.log('Body length:', req.body.length);
      console.log('Body preview:', req.body.slice(0, 100).toString());
    }
    next();
  },
  handleStripeWebhook
);

// PayPal webhook
app.post('/api/order/paypal/webhook', express.json(), handlePaypalWebhook);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', usersRouter);
app.use('/api/products', productsRouter);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/order', ordersRouter);

// Utility endpoints for manual payment fixes
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
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log('Endpoints:');
  console.log('  Stripe webhook:    /api/order/stripe-webhook');
  console.log('  PayPal webhook:    /api/order/paypal/webhook');
  console.log('  Fix PayPal:        /api/fix-paypal-payments');
  console.log('  Fix Stripe:        /api/fix-stripe-payments');
  console.log('  Cart sync:         /api/cart/sync');
  console.log('  Wishlist sync:     /api/wishlist/sync');
});
