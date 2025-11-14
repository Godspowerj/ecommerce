import express from "express";
const router = express.Router();
import { createProduct, getProductById, updateProduct, deleteProduct,getProducts } from "../controllers/productController.js";
import { upload } from "../config/cloudinary.js";
import authenticateTOKEN from "../middleware/auth.js";
import adminCheck from "../middleware/adminCheck.js";
import { productValidationRules } from "../validators/productValidators.js";
import { validation } from "../middleware/validation.js";

// Define your order routes here, for example:
router.post('/create',authenticateTOKEN, adminCheck , productValidationRules , validation ,  upload.single('image'), createProduct);
router.get('/:id', getProductById);
router.put('/:id',authenticateTOKEN, adminCheck , upload.single('image'), updateProduct);
router.delete('/:id',authenticateTOKEN, adminCheck, deleteProduct);
router.get('/', getProducts);

export default router;