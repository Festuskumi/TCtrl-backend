import usersModels from "../Models/userModels.js";

// ----------------------
// Add to Wishlist
// ----------------------
const addToWishlist = async (req, res) => {
  try {
    const { productId, size } = req.body;
    const userId = req.userId;

    if (!userId || !productId || !size) {
      return res.status(400).json({ success: false, message: "ProductId and size are required" });
    }

    const user = await usersModels.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const wishlist = user.wishlistDetails || {};
    if (!wishlist[productId]) wishlist[productId] = {};
    wishlist[productId][size] = { quantity: 1 };

    await usersModels.findByIdAndUpdate(userId, { wishlistDetails: wishlist });

    return res.json({ success: true, message: "Item added to wishlist" });
  } catch (error) {
    console.error("Add to wishlist error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ----------------------
// Remove from Wishlist
// ----------------------
const removeFromWishlist = async (req, res) => {
  try {
    const { productId, size } = req.body;
    const userId = req.userId;

    if (!userId || !productId || !size) {
      return res.status(400).json({ success: false, message: "ProductId and size are required" });
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
      return res.json({ success: true, message: "Item removed from wishlist" });
    }

    return res.status(404).json({ success: false, message: "Item not found in wishlist" });
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ----------------------
// Get Wishlist
// ----------------------
const getUserWishlist = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
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
    console.error("Get wishlist error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ----------------------
// Sync Wishlist
// ----------------------
const syncWishlistFromLocal = async (req, res) => {
  try {
    const userId = req.userId;
    const { items } = req.body;

    if (!userId || !Array.isArray(items)) {
      return res.status(400).json({ success: false, message: "User ID and valid items array required" });
    }

    const user = await usersModels.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const wishlist = user.wishlistDetails || {};

    items.forEach(({ productId, size }) => {
      if (!wishlist[productId]) wishlist[productId] = {};
      wishlist[productId][size] = { quantity: 1 };
    });

    await usersModels.findByIdAndUpdate(userId, { wishlistDetails: wishlist });

    res.json({ success: true, message: "Wishlist synchronized successfully" });
  } catch (error) {
    console.error("Wishlist sync error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export {
  addToWishlist,
  removeFromWishlist,
  getUserWishlist,
  syncWishlistFromLocal
};