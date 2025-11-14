import usersDetails from "../models/user.js";
import productDetails from "../models/product.js";
import Order from "../models/order.js";



// 1. DASHBOARD STATS FUNCTION
export const getDashboardStats = async (req, res) => {
  try {
    // We'll count users, products, orders, and revenue here
    // This will return the business summary
    const userCount = await usersDetails.countDocuments();
    const productCount = await productDetails.countDocuments();
    const orderCount = await Order.countDocuments();

    const totalRevenue = await Order.aggregate([
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    res.status(200).json({
        userCount,
        productCount,
        orderCount,
        totalRevenue: totalRevenue[0] ? totalRevenue[0].total : 0
    });
    
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// 2. GET ALL ORDERS FUNCTION
export const getAllOrders = async (req, res) => {
  try {
    // We'll get all orders with customer and product details
    const orders = await Order.find().populate("user").populate("products.product");
    res.status(200).json(orders);

    
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// 3. GET ALL USERS FUNCTION
export const getAllUsers = async (req, res) => {
  try {
    // We'll get all users with their order counts
    const users = await usersDetails.find();
    const usersWithOrderCounts = await Promise.all(users.map(async (user) => {
        const orderCount = await Order.countDocuments({ user: user._id });
        return {
            ...user.toObject(),
            orderCount
        };
    }));
    res.status(200).json(usersWithOrderCounts);
    
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// 4. GET ALL PRODUCTS FUNCTION
export const getAllProducts = async (req, res) => {
  try {
    // We'll get all products with sales data
    const products = await productDetails.find();
    const productsWithSales = await Promise.all(products.map(async (product) => {
        const salesCount = await Order.aggregate([
            { $unwind: "$products" },
            { $match: { "products.product": product._id } },
            { $group: { _id: null, totalSold: { $sum: "$products.quantity" } } }
        ]);
        return {
            ...product.toObject(),
            salesCount: salesCount[0] ? salesCount[0].totalSold : 0
        };
    }));
    res.status(200).json(productsWithSales);

    
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};