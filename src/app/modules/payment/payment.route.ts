import { Router } from "express";
import { paymentControler, paymentController } from "./payment.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = Router();

router.post(
  "/initiate-payment",
  auth(UserRole.CUSTOMER, UserRole.VENDOR, UserRole.ADMIN),
  paymentController.initiatePayment
);

router.post("/confirmation", paymentControler.confirmationController);

export const PaymentRoutes = router;
