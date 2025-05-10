import mongoose from 'mongoose';

const ordersSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true, // Optimized queries by user
  },
  products: {
    type: Array,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  address: {
    type: Object,
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: 'Order placed',
    enum: ['Order placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Paid'],
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['COD', 'Stripe', 'PayPal'],
    index: true,
  },
  payment: {
    type: Boolean,
    required: true,
    default: false,
    index: true,
  },
  stripeSessionId: {
    type: String,
    sparse: true, // Only indexes when present
  },
  paypalOrderId: {
    type: String,
    sparse: true,
  },
  date: {
    type: Number,
    required: true,
    index: true,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields automatically
  methods: {
    markAsPaid() {
      this.payment = true;
      this.status = 'Paid';
      return this.save();
    }
  }
});

// Indexes for performance
ordersSchema.index({ paymentMethod: 1, payment: 1 });        // Composite query optimization
ordersSchema.index({ 'products.title': 'text' });            // Enable text search on product titles

// Avoid model overwrite issues during dev (e.g., in hot reload environments)
const ordersModel = mongoose.models.order || mongoose.model('order', ordersSchema);

export default ordersModel;
