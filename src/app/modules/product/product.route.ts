import express from "express";
import { ProductController } from "./product.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { fileUpload } from "../../utils/fileUpload";

const router = express.Router();

router.post(
  "/create",
  auth(UserRole.VENDOR, UserRole.ADMIN),
  // fileUpload.single("image"),
  fileUpload.array("image", 10),
  ProductController.createProduct
);
router.post(
  "/duplicate/:productId",
  auth(UserRole.VENDOR, UserRole.ADMIN),
  fileUpload.single("image"),
  ProductController.duplicateProduct
);
router.put(
  "/update/:productId",
  auth(UserRole.VENDOR, UserRole.ADMIN),
  fileUpload.array("image", 10),
  ProductController.updateProduct
);
router.delete(
  "/delete/:productId",
  auth(UserRole.VENDOR, UserRole.ADMIN),
  ProductController.deleteProduct
);
router.get("/", ProductController.getAllProducts);
router.get("/:productId", ProductController.getProductById);
router.get(
  "/category-related/:categoryId",
  ProductController.getProductsByCategory
);
router.get(
  "/shop-follower",
  auth(UserRole.CUSTOMER),
  ProductController.getShopFollowerProducts
);

export const ProductRoutes = router;
