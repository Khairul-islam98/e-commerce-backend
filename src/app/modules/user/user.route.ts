import express from "express";
import { fileUpload } from "../../utils/fileUpload";
import { UserController } from "./user.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.get(
  "/my-profile",
  auth(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.VENDOR),
  UserController.getUser
);
router.patch(
  "/update-profile",
  auth(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.VENDOR),
  fileUpload.single("image"),
  UserController.updateUser
);
router.get("/", auth(UserRole.ADMIN), UserController.getAllUsers);
router.patch(
  "/status/:userId",
  auth(UserRole.ADMIN),
  UserController.userStatusChange
);
router.get("/shop", auth(UserRole.ADMIN), UserController.getAllShop);
router.patch(
  "/blacklist/:shopId",
  auth(UserRole.ADMIN),
  UserController.createBlacklistShop
);

router.get(
  "/transactions-history",
  auth(UserRole.ADMIN),
  UserController.totalTransactionsHistory
);

router.get("/overview", auth(UserRole.ADMIN), UserController.getOverview);
router.get(
  "/transaction-overview",
  auth(UserRole.ADMIN),
  UserController.getMonthlyTransactionOfCurrentYear
);
router.get(
  "/review-overview",
  auth(UserRole.ADMIN),
  UserController.getMonthlyReviewOfCurrentYear
);

export const UserRoutes = router;
