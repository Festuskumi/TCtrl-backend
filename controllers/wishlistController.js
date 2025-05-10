import usersModels from "../Models/userModels.js";

// Add to Wishlist
const addToWishlist = async (req, res) => {
  try {
    const { productId, size } = req.body;
    const userId = req.userId;

    if (!userId || !productId || !size) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const user = await usersModels.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const wishlist = user.wishlistDetails || {};

    if (!wishlist[productId]) wishlist[productId] = {};
    wishlist[productId][size] = { quantity: 1 };

    await usersModels.findByIdAndUpdate(userId, { wishlistDetails: wishlist });

    return res.json({ success: true, message: "Added to wishlist successfully" });
  } catch (error) {
    console.error("❌ Add Wishlist Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Remove from Wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const { productId, size } = req.body;
    const userId = req.userId;

    if (!userId || !productId || !size) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const user = await usersModels.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const wishlist = user.wishlistDetails || {};

    if (wishlist[productId]?.[size]) {
      delete wishlist[productId][size];
      if (Object.keys(wishlist[productId]).length === 0) {
        delete wishlist[productId];
      }

      await usersModels.findByIdAndUpdate(userId, { wishlistDetails: wishlist });
      return res.json({ success: true, message: "Removed from wishlist" });
    }

    return res.status(404).json({ success: false, message: "Item not found in wishlist" });
  } catch (error) {
    console.error("❌ Remove Wishlist Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get User Wishlist
const getUserWishlist = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID missing" });
    }

    const user = await usersModels.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const wishlist = user.wishlistDetails || {};
    const formattedWishlist = [];

    for (const productId in wishlist) {
      for (const size in wishlist[productId]) {
        formattedWishlist.push({
          productId,
          size,
          quantity: wishlist[productId][size]?.quantity || 1,
        });
      }
    }

    return res.json({ success: true, wishlist: formattedWishlist });
  } catch (error) {
    console.error(" Get Wishlist Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Sync local wishlist with user's wishlist in database
const syncWishlistFromLocal = async (req, res) => {
  try {
    const userId = req.userId;
    const { items } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID required" });
    }

    const user = await usersModels.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Get current wishlist from user model
    const wishlist = user.wishlistDetails || {};
    
    // Merge local wishlist with current wishlist
    if (items && items.length > 0) {
      items.forEach(item => {
        const { productId, size } = item;
        
        if (!wishlist[productId]) {
          wishlist[productId] = {};
        }
        
        // Add item to wishlist with the correct structure
        wishlist[productId][size] = { quantity: 1 };
      });
    }

    // Update user's wishlist in database
    await usersModels.findByIdAndUpdate(userId, { wishlistDetails: wishlist });

    res.json({ 
      success: true, 
      message: "Wishlist synchronized successfully" 
    });
  } catch (error) {
    console.error("❌ Wishlist Sync Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to synchronize wishlist" 
    });
  }
};

export { addToWishlist, removeFromWishlist, getUserWishlist, syncWishlistFromLocal };