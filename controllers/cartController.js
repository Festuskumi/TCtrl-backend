import usersModels from "../Models/userModels.js";

// Add product to cart
const addProductToCart = async (req, res) => {
  try {
    const userId = req.userId; // from userVerify middleware
    const { ItemId, size } = req.body;

    if (!userId || !ItemId || !size) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const userDetails = await usersModels.findById(userId);
    if (!userDetails) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const cartDetails = userDetails.cartDetails || {};

    if (!cartDetails[ItemId]) cartDetails[ItemId] = {};
    cartDetails[ItemId][size] = (cartDetails[ItemId][size] || 0) + 1;

    await usersModels.findByIdAndUpdate(userId, { cartDetails });

    res.json({ success: true, message: "Added to cart successfully" });
  } catch (error) {
    console.error("Add to cart error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update quantity or remove item
const updateProductToCart = async (req, res) => {
  try {
    const userId = req.userId; // from userVerify middleware
    const { ItemId, size, quantity } = req.body;

    if (!userId || !ItemId || !size || typeof quantity !== "number") {
      return res.status(400).json({ success: false, message: "Invalid input" });
    }

    const userDetails = await usersModels.findById(userId);
    if (!userDetails) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const cartDetails = userDetails.cartDetails || {};

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

    res.json({ success: true, message: "Updated cart successfully" });
  } catch (error) {
    console.error("Cart update error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user cart
const getUserCart = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID required" });
    }

    const userDetails = await usersModels.findById(userId);
    if (!userDetails) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const cartDetails = userDetails.cartDetails || {};
    const cartArray = [];

    for (const productId in cartDetails) {
      for (const size in cartDetails[productId]) {
        cartArray.push({
          product: { _id: productId },
          size,
          quantity: cartDetails[productId][size],
        });
      }
    }

    res.json({ success: true, cart: cartArray });
  } catch (error) {
    console.error("Get cart error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Sync local cart with user's cart in database
const syncCartFromLocal = async (req, res) => {
  try {
    const userId = req.userId;
    const { items } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID required" });
    }

    const userDetails = await usersModels.findById(userId);
    if (!userDetails) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Get current cart from user model
    const currentCart = userDetails.cartDetails || {};
    
    // Convert items array to cartDetails format and merge with current cart
    const newCart = { ...currentCart };
    
    if (items && items.length > 0) {
      items.forEach(item => {
        const { productId, size, quantity } = item;
        
        if (!newCart[productId]) {
          newCart[productId] = {};
        }
        
        // If the item already exists in cart, keep the higher quantity
        const existingQuantity = newCart[productId][size] || 0;
        newCart[productId][size] = Math.max(quantity, existingQuantity);
      });
    }

    // Update user's cart in database
    await usersModels.findByIdAndUpdate(userId, { cartDetails: newCart });

    res.json({ 
      success: true, 
      message: "Cart synchronized successfully" 
    });
  } catch (error) {
    console.error("Cart sync error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Failed to synchronize cart",
      error: error.message 
    });
  }
};

export { addProductToCart, updateProductToCart, getUserCart, syncCartFromLocal };