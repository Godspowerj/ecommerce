import express from "express";
const router = express.Router();
import {
  createOrder,
  getOrders,
  updateOrder,
  getOrderById,
  deleteOrder,
} from "../controllers/orderController.js";
import authenticateTOKEN from "../middleware/auth.js";
import adminCheck from "../middleware/adminCheck.js";

// Define your order routes here, for example:
router.post("/create", createOrder);
router.get("/", getOrders);
router.get("/:id", getOrderById);
router.put("/:id", authenticateTOKEN, adminCheck, updateOrder);
router.delete("/:id", authenticateTOKEN, adminCheck, deleteOrder);

export default router;
