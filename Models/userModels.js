import mongoose from "mongoose";

const usersSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
    index: true,
  },
  verificationCode: {
    type: String,
    default: null,
  },
  verificationCodeExpires: {
    type: Date,
    default: null,
  },
  resetCode: {
    code: { type: String },
    expires: { type: Date },
  },
  cartDetails: {
    type: Object,
    default: {},
  },
  wishlistDetails: {
    type: Object,
    default: {},
  },
}, {
  minimize: false,
  timestamps: true, // adds createdAt and updatedAt
});

const usersModels = mongoose.models.user || mongoose.model('user', usersSchema);

export default usersModels;
