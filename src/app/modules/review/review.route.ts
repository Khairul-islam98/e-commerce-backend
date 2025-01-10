import express from "express";
import { ReviewController } from "./review.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { fileUpload } from "../../utils/fileUpload";

const router = express.Router();

router.post(
  "/create",
  auth(UserRole.CUSTOMER, UserRole.ADMIN, UserRole.VENDOR),
  fileUpload.array("image", 10),
  ReviewController.createReview
);
router.get("/:productId", ReviewController.getReviewsProduct);
router.post(
  "/createReplay",
  auth(UserRole.CUSTOMER, UserRole.ADMIN, UserRole.VENDOR),
  ReviewController.createReplayReview
);
router.get(
  "/",
  auth(UserRole.VENDOR, UserRole.ADMIN),
  ReviewController.getMyShopReviews
);

export const ReviewRoutes = router;
