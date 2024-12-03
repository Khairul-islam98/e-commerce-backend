import express from "express";
import { ShopController } from "./shop.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { fileUpload } from "../../utils/fileUpload";

const router = express.Router();

router.post(
  "/create",
  auth(UserRole.VENDOR, UserRole.ADMIN),
  fileUpload.single("image"),
  ShopController.createShop
);
router.get("/my-shop", ShopController.getShopUser);
router.patch(
  "/update",
  auth(UserRole.VENDOR, UserRole.ADMIN),
  fileUpload.single("image"),
  ShopController.updateShop
);
router.post("/follow", auth(UserRole.CUSTOMER), ShopController.followShop);
router.post("/unfollow", auth(UserRole.CUSTOMER), ShopController.unfollowShop);
router.post("/following", ShopController.userFollowedShop);
router.get("/followed-count", ShopController.shopFollowedCount);

export const ShopRoutes = router;
