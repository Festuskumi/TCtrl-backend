import express from 'express';
import {
  addToWishlist,
  getUserWishlist,
  removeFromWishlist,
  syncWishlistFromLocal
} from '../controllers/wishlistController.js';
import userVerify from '../middleware/userVerify.js';

const router = express.Router();

router.post('/add', userVerify, addToWishlist);
router.post('/remove', userVerify, removeFromWishlist);
router.post('/get', userVerify, getUserWishlist); 
router.post('/sync', userVerify, syncWishlistFromLocal);

export default router;