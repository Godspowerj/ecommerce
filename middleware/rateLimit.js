import rateLimit from "express-rate-limit";

export const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 100,
  message: {
    status: "error",
    statusCode: 429,
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
