import express from "express";
import { fileUpload } from "../../utils/fileUpload";
import { UserController } from "./user.controller";

const router = express.Router();

router.get("/my-profile", UserController.getUser);
router.patch(
  "/update-profile",
  fileUpload.single("image"),
  UserController.updateUser
);

export const UserRoutes = router;
