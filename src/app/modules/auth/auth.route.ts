import express from "express";
import { fileUpload } from "../../utils/fileUpload";
import { AuthController } from "./auth.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.post(
  "/signup",
  fileUpload.single("image"),
  AuthController.createAccount
);

router.post("/login", AuthController.loginUser);
router.post("/refresh-token", AuthController.refreshToken);
router.post(
  "/change-password",
  auth(UserRole.ADMIN, UserRole.VENDOR, UserRole.CUSTOMER),
  AuthController.changePassword
);

router.post("/forget-password", AuthController.forgetPassword);
router.post("/reset-password", AuthController.resetPassword);

export const AuthRoutes = router;
