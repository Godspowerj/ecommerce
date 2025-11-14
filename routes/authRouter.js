import express from "express";
import { SignupController, LoginController , resetPasswordController } from "../controllers/authController.js";
const router = express.Router();
import { apiLimiter } from "../middleware/rateLimit.js";

// Define your auth routes here, for example:
router.post("/signup" , apiLimiter , SignupController); 
router.post("/login" , LoginController);
router.post("/reset-password" , resetPasswordController);


export default router;