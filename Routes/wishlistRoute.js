import express from 'express';
import {
  addToWishlist,
  getUserWishlist,
  removeFromWishlist,
  syncWishlistFromLocal
} from '../controllers/wishlistController.js';
import userVerify from '../middleware/userVerify.js';

const router = express.Router();

// ----------------------
// Wishlist Routes
// ----------------------

// ✅ Add a product to the wishlist
router.post('/add', userVerify, addToWishlist);

// ✅ Remove a product from the wishlist
router.post('/remove', userVerify, removeFromWishlist);

// ✅ Get the user's wishlist (converted to GET for REST compliance)
router.get('/get', userVerify, getUserWishlist);

// ✅ Sync local wishlist to user's account
router.post('/sync', userVerify, syncWishlistFromLocal);

export default router;