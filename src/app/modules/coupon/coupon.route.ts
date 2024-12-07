import express from "express";

import { CouponController } from "./coupon.controller";

const router = express.Router();

router.post("/", CouponController.createCoupon);
router.get("/", CouponController.getCoupone);
router.get("/:productId", CouponController.getCouponByProductId);

export const CouponRoutes = router;
