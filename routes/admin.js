import express from "express";
const router = express.Router();
import { getDashboardStats, getAllOrders ,getAllProducts ,getAllUsers } from "../controllers/adminController.js";

router.get("/dashboard-stats", getDashboardStats);
router.get("/orders", getAllOrders);
router.get("/products", getAllProducts);
router.get("/users", getAllUsers);

export default router;

