import jwt from "jsonwebtoken";
import usersModels from "../Models/userModels.js"; // if needed

const userVerify = async (req, res, next) => {
  const tokenHeader = req.headers.authorization || req.headers.Authorization;

  if (!tokenHeader || !tokenHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Login verification failed. Please log in again.",
    });
  }

  const token = tokenHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_CODE);
    req.userId = decoded.id;

    // OPTIONAL: Check if user exists and is verified
    const user = await usersModels.findById(decoded.id);
    if (!user || !user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Account not verified. Please verify your email.",
      });
    }

    next();
  } catch (error) {
    console.error("JWT verification error:", error.message);
    res.status(401).json({
      success: false,
      message: "Invalid or expired token. Please log in again.",
    });
  }
};

export default userVerify;
