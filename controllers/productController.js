import productDetails from "../models/product.js";
import cloudinary from "../config/cloudinary.js";
import { categoryDetails } from "../models/category.js";
import redisClient from "../config/redisClient.js";


export const createProduct = async (req, res) => {
  const { name, price, description, category } = req.body;

  try {
    // Create product with image data from req.file
   const categoryDoc = await categoryDetails.findOne({ name: category });

    const product = {
      name,
      price,
      description,
      image: {
        url: req.file.path, // Cloudinary image URL
        public_id: req.file.filename, // Cloudinary's unique ID
      },
      category: categoryDoc._id
    };

    await productDetails.create(product);
    res.status(201).json({ message: "Product created successfully" , product });
  } catch (error) {
    next(error); // Pass error to global error handler
  }
};

export const getProducts = async (req, res) => {
  try {
    const cachedProducts = await redisClient.get("products");

    if (cachedProducts) {
      console.log("💨 Data from Redis cache");
      return res.status(200).json(JSON.parse(cachedProducts));
    }

    console.log("🗄️ Data from MongoDB");
    const products = await productDetails.find().populate("category");

    await redisClient.setEx("products", 600, JSON.stringify(products));

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const getProductById = async (req, res) => {
  try {
    const product = await productDetails.findById(req.params.id).populate("category");
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { name, price, description } = req.body;
    const updatedData = { name, price, description };

    const oldproduct = await productDetails.findById(req.params.id).populate("category");

    if (req.file) {
      // First delete old image from Cloudinary
      await cloudinary.uploader.destroy(oldproduct.image.public_id);
      // Then add new image
      updatedData.image = {
        url: req.file.path,
        public_id: req.file.filename,
      };
    }
    const product = await productDetails.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product updated successfully", product });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await productDetails.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    await cloudinary.uploader.destroy(product.image.public_id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}


