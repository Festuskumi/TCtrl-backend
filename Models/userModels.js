import mongoose from "mongoose";

const usersSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true 
  },
  password: { type: String, required: true },
  isVerified: { 
    type: Boolean, 
    default: false, 
    index: true 
  },
  cartDetails: { type: Object, default: {} },
  wishlistDetails: { type: Object, default: {} },

  resetCode: {
    code: { type: String },
    expires: { type: Date },
  },
}, {
  minimize: false,
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

const usersModels = mongoose.models.user || mongoose.model('user', usersSchema);

export default usersModels;
