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

export const UserRoutes = router;
