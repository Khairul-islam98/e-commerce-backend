import express from "express";
import { CategoryController } from "./category.controller";

const router = express.Router();

router.post("/", CategoryController.createCategory);
router.get("/", CategoryController.getAllCategories);
router.get("/:categoryId", CategoryController.getCategoryById);
router.patch("/:categoryId", CategoryController.updateCategory);
router.delete("/:categoryId", CategoryController.deleteCategory);

export const CategoryRoutes = router;
