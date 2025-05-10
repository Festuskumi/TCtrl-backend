import mongoose from "mongoose";

const productsSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: Array, required: true },
    category: { type: String, required: true },
    subcategory: { type: String, required: true },
    sizes: { type: Array, required: true },
    trending: { type: Boolean, default: false },
    date: { type: Number, required: true }
});

const productsModel = mongoose.models.products || mongoose.model("products", productsSchema);

export default productsModel;
