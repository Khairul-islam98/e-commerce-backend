import { RecentController } from "./recent.controller";
import express from "express";

const router = express.Router();

router.post("/productId", RecentController.getProductsByIds);

export const RecentRoutes = router;
