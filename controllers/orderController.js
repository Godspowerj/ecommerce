import Order from "../models/order.js";
import { PaymentService } from "../services/paymentServices.js";
import User from "../models/user.js";
import redisClient from "../config/redisClient.js";

// POST /api/orders
export const createOrder = async (req, res, next) => {
  try {
    const { userId, products, totalAmount } = req.body;
    const user = await User.findById(userId);
    const email = user?.email || req.body.email;

    const totalAmountCalculated = products.reduce(
      (total, item) => total + item.quantity * item.price,
      0
    );

    if (totalAmount !== totalAmountCalculated) {
      return res.status(400).json({ message: "Total amount mismatch" });
    }

    const order = new Order({
      user: userId,
      product: products, // ✅ match schema
      totalAmount: totalAmountCalculated,
      status: "pending",
    });
    
    // Initialize payment service instance
    const paymentService = new PaymentService();
    
    // Generate a unique payment reference for the order
    const reference = `order_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    order.paymentReference = reference;
    
    // Initialize payment with payment service using the calculated total amount and reference and email of the user 
    const paymentResult = await paymentService.initializePayment(
      email,
      totalAmountCalculated,
      reference
    );

    await order.save();

    res.status(201).json({
      message: "Order created successfully",
      order,
      paymentUrl: paymentResult.data.authorization_url,
      paymentReference: paymentResult.data.reference,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (req, res) => {
  try {
    const cachedProducts = await redisClient.get("orders");

    if (cachedProducts) {
      console.log("Data from Redis cache");
      return res.status(200).json(JSON.parse(cachedProducts));
    }
    const orders = await Order.find().populate("user").populate("product");
    await redisClient.setEx("orders", 600, JSON.stringify(orders));
    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getOrderById = async (req, res) => {
  const orderId = req.params.id;
  try {
    const order = await Order.findById(orderId)
      .populate("user")
      .populate("product");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateOrder = async (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    order.status = status || order.status;
    await order.save();

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteOrder = async (req, res) => {
  const orderId = req.params.id;
  try {
    const order = await Order.findByIdAndDelete(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
