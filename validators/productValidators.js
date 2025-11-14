
import { body } from "express-validator";

// body("fieldName") -> selects a field from req.body and applies validation rules on it
// notEmpty() -> checks if the field is not empty
// isFloat({ gt: 0 }) -> checks if the field is a float greater than 0
// optional() -> makes the field optional for validation
// isString() -> checks if the field is a string
// withMessage("message") -> custom error message if validation fails

export const productValidationRules = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("price").isFloat({ gt: 0 }).withMessage("Price must be a number greater than 0"),
  body("description").optional().isString().withMessage("Description must be a string"),
  body("category").notEmpty().withMessage("Category is required"),
];

// Exporting an array of validation rules for product-related requests
// These rules can be used as middleware in Express routes to validate incoming data
// Example usage: app.post('/products', productValidationRules, validationResult, createProduct);
// This ensures that the data being processed in the route handlers meets the specified criteria
// If any validation fails, an error response will be sent back to the client

// This helps maintain data integrity and prevents invalid data from being processed or stored
// It also provides clear feedback to clients about what went wrong with their request
// Overall, this is a crucial part of building robust and reliable APIs with Express.js
