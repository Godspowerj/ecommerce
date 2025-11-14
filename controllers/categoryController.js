import redisClient from "../config/redisClient.js";
import { categoryDetails } from "../models/category.js";
import slugify from "slugify";


export const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const existingCategory = await categoryDetails.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: "Category name must be unique" });
    }

    const slug = slugify(name, { lower: true, strict: true });
    const category = new categoryDetails({ name, description, slug });
    await category.save();
    
    res.status(201).json({ 
      success: true,
      message: "Category created successfully", 
      category 
    });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req, res) => {
  try {
    const categoryCache = await redisClient.get("categories");

    if (categoryCache) {
      console.log("💨 Data from Redis cache");
      return res.status(200).json(JSON.parse(categoryCache));
    }
    const categories = await categoryDetails.find();
    res.status(200).json({
      success: true,
      data: categories
    });

   await redisClient.setEx("categories", 600 , json.stringify(categories))

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const category = await categoryDetails
      .findById(req.params.id)
      .populate("products");

    if (!category) {
      return res.status(404).json({ 
        success: false,
        message: "Category not found" 
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

export const getCategoryBySlug = async (req, res) => {
  try {
    const category = await categoryDetails
      .findOne({ slug: req.params.slug })
      .populate("products");
      
    if (!category) {
      return res.status(404).json({ 
        success: false,
        message: "Category not found" 
      });
    }
    
    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};