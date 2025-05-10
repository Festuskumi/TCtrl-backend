import { log } from "console";
import { v2 as cloudinary } from "cloudinary";
import productsModel from "../Models/productsMo.js";

const addProducts = async (req, res) => {
    try {
        const { name, description, price, category, subcategory, sizes, trending } = req.body;

        // Ensure `req.files` exists
        const files = req.files || {};

        // Extract images safely
        const images = ["image1", "image2", "image3", "image4"]
            .map(field => files[field]?.[0])
            .filter(Boolean); // Remove `null` values

        // Upload images to Cloudinary
        const imageUrls = await Promise.all(
            images.map(async (item) => {
                let outcome = await cloudinary.uploader.upload(item.path, { resource_type: "image" });
                return outcome.secure_url;
            })
        );

        // Validate `sizes` input (ensure it's an array)
        let parsedSizes;
        try {
            parsedSizes = JSON.parse(sizes);
            if (!Array.isArray(parsedSizes)) throw new Error("Invalid sizes format");
        } catch (err) {
            return res.json({ success: false, message: "Invalid sizes format, must be an array" });
        }

        // Product Data
        const productsDetails = {
            name,
            description,
            category,
            price: Number(price),
            subcategory,
            trending: trending === "true", // Correct boolean conversion
            sizes: parsedSizes,
            image: imageUrls,// Ensure at least one image
            date: Date.now()
        };

        console.log(productsDetails);

        // Save Product
        const product = new productsModel(productsDetails);
        await product.save();

        res.json({ success: true, message: "Product added successfully" });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};


//function for list new products
const listProducts = async(req, res)=>{
    try {
        const products = await productsModel.find({});
        res.json({success:true, products})
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
}


//this is a function for removing products
const deleteProducts = async (req, res) => {
    try {
        const { id } = req.params; 

        if (!id) {
            return res.status(400).json({ success: false, message: "Product ID is required" });
        }

        const deletedProduct = await productsModel.findByIdAndDelete(id);

        if (!deletedProduct) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        res.json({ success: true, message: "Product deleted successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};



//function for single productsDetails
const singleProducts = async(req, res)=>{
    try {
        const {productsId}= req.body
        const product = await productsModel.findById(productsId)
        res.json({success:true, product})
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
}
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category, price } = req.body;

        const updatedProduct = await productsModel.findByIdAndUpdate(
            id,
            { name, category, price },
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        res.json({ success: true, message: "Product updated successfully", product: updatedProduct });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export {listProducts, addProducts, singleProducts, deleteProducts, updateProduct }