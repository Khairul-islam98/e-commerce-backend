import express from "express";
import { OrderController } from "./order.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.post(
  "/",
  auth(UserRole.CUSTOMER, UserRole.ADMIN, UserRole.VENDOR),
  OrderController.createOrder
);
router.get(
  "/my-order",
  auth(UserRole.CUSTOMER, UserRole.ADMIN, UserRole.VENDOR),
  OrderController.getUserOrders
);

router.get(
  "/vendor-order",
  auth(UserRole.VENDOR, UserRole.ADMIN),
  OrderController.getOrderVendor
);

export const OrderRoutes = router;
