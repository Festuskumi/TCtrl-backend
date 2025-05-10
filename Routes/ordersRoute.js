import express from 'express';
import {
  placeOrderCOD,
  placeOrderPaypal,
  placeOrderStripe,
  allOrders,
  updateOrderStatus,
  customersOrders
} from '../controllers/ordersController.js';

import adminverify from '../middleware/adminverify.js';
import userVerify from '../middleware/userVerify.js';

const ordersRouter = express.Router();

// --------------------
// Admin Routes
// --------------------
ordersRouter.post('/list', adminverify, allOrders);              // View all orders
ordersRouter.post('/status', adminverify, updateOrderStatus);    // Update order status

// --------------------
// Payment Placement Routes
// --------------------
ordersRouter.post('/place', userVerify, placeOrderCOD);          // Place order with Cash on Delivery
ordersRouter.post('/stripe', userVerify, placeOrderStripe);      // Place order with Stripe
ordersRouter.post('/paypal', userVerify, placeOrderPaypal);      // Place order with PayPal

// --------------------
// Customer Routes
// --------------------
ordersRouter.post('/customerorders', userVerify, customersOrders); // Get current user's orders

export default ordersRouter;
