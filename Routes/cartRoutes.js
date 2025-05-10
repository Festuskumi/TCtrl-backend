import express from 'express';
import {
  addProductToCart,
  updateProductToCart,
  getUserCart,
  syncCartFromLocal
} from '../controllers/cartController.js';
import userVerify from '../middleware/userVerify.js';

const router = express.Router();

// Add a product to the user's cart
router.post('/add', userVerify, addProductToCart);

// Update quantity or remove a product from cart
router.post('/update-item', userVerify, updateProductToCart);

// Get the current user's cart
router.post('/get', userVerify, getUserCart);

// Sync local cart items with user's account
router.post('/sync', userVerify, syncCartFromLocal);

export default router;