import usersModels from "../Models/userModels.js";

// ----------------------
// Add product to cart
// ----------------------
const addProductToCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { ItemId, size } = req.body;

    if (!userId || !ItemId || !size) {
      return res.status(400).json({ success: false, message: "ItemId and size are required" });
    }

    const user = await usersModels.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const cartDetails = user.cartDetails || {};
    if (!cartDetails[ItemId]) cartDetails[ItemId] = {};
    cartDetails[ItemId][size] = (cartDetails[ItemId][size] || 0) + 1;

    await usersModels.findByIdAndUpdate(userId, { cartDetails });

    res.json({ success: true, message: "Item added to cart successfully" });
  } catch (error) {
    console.error("Add to cart error:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ----------------------
// Update cart item quantity or remove item
// ----------------------
const updateProductToCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { ItemId, size, quantity } = req.body;

    if (!userId || !ItemId || !size || typeof quantity !== "number") {
      return res.status(400).json({ success: false, message: "ItemId, size, and numeric quantity are required" });
    }

    const user = await usersModels.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const cartDetails = user.cartDetails || {};
    if (!cartDetails[ItemId]) cartDetails[ItemId] = {};

    if (quantity <= 0) {
      delete cartDetails[ItemId][size];
      if (Object.keys(cartDetails[ItemId]).length === 0) {
        delete cartDetails[ItemId];
      }
    } else {
      cartDetails[ItemId][size] = quantity;
    }

    await usersModels.findByIdAndUpdate(userId, { cartDetails });

    res.json({ success: true, message: "Cart updated successfully" });
  } catch (error) {
    console.error("Cart update error:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ----------------------
// Get user cart
// ----------------------
const getUserCart = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID required" });
    }

    const user = await usersModels.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const cartDetails = user.cartDetails || {};
    const cartArray = [];

    for (const productId in cartDetails) {
      for (const size in cartDetails[productId]) {
        const quantity = cartDetails[productId][size];
        if (quantity > 0) { // Only include items with positive quantity
          cartArray.push({
            product: { _id: productId },
            productId, // Add this for compatibility
            size,
            quantity: quantity,
          });
        }
      }
    }

    res.json({ success: true, cart: cartArray });
  } catch (error) {
    console.error("Get cart error:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ----------------------
// Sync local cart to server
// ----------------------
const syncCartFromLocal = async (req, res) => {
  try {
    const userId = req.userId;
    const { items } = req.body;

    if (!userId || !Array.isArray(items)) {
      return res.status(400).json({ success: false, message: "User ID and valid items array required" });
    }

    const user = await usersModels.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const currentCart = user.cartDetails || {};
    const newCart = { ...currentCart };

    items.forEach(({ productId, size, quantity }) => {
      if (productId && size && quantity > 0) { // Validate each item
        if (!newCart[productId]) newCart[productId] = {};
        const current = newCart[productId][size] || 0;
        newCart[productId][size] = Math.max(current, quantity);
      }
    });

    await usersModels.findByIdAndUpdate(userId, { cartDetails: newCart });

    res.json({ success: true, message: "Cart synchronized successfully" });
  } catch (error) {
    console.error("Cart sync error:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export {
  addProductToCart,
  updateProductToCart,
  getUserCart,
  syncCartFromLocal
};