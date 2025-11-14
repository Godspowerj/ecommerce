import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import authRouter from "./routes/authRouter.js";
import orderRouter from "./routes/orderRouter.js";
import productRouter from "./routes/productRouter.js";
import categoryRouter from "./routes/categoryRouter.js";
import adminCheck from "./middleware/adminCheck.js";
import authenticateTOKEN from "./middleware/auth.js";
import { globalErrorHandler } from "./middleware/errorHandler.js";
import { apiLimiter } from "./middleware/rateLimit.js";
import {
  initializePayment,
  verifyPayment,
} from "./controllers/paymentController.js";
import adminRouter from "./routes/admin.js";


dotenv.config();

export const app = express();

// Middlewares
app.use(express.json());
app.use(apiLimiter);
app.use(helmet());

// Routes
app.use("/auth", authRouter);
app.use("/orders", orderRouter);
app.use("/products", productRouter);
app.use("/categories", categoryRouter);

// Admin route (lazy-loaded)
app.use(
  "/admin",
  authenticateTOKEN,
  adminCheck,
  adminRouter
);

// Payment routes
app.post("/payment/initialize", initializePayment);
app.get("/payment/verify/:reference", verifyPayment);

// Global error handler
app.use(globalErrorHandler);
