import express from "express";
import  { createCategory, getCategoryById, getCategories } from "../controllers/categoryController.js";
import authenticateTOKEN from "../middleware/auth.js";
import adminCheck from "../middleware/adminCheck.js";

const router = express.Router();

router.post('/create', authenticateTOKEN, adminCheck, createCategory);
router.get('/:id', getCategoryById);
router.get('/', getCategories);

export default router;