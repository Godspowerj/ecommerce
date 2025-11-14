import { validationResult } from "express-validator";

export const validation = (req, res, next) => {
  // Check for validation errors in the request
  const errors = validationResult(req);

  // If there are errors, send them and stop the request
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Otherwise, continue to the next middleware/controller
  console.log("Validation passed", errors);
  next();
};
