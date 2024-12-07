import express from "express";
import { FlashSaleController } from "./flashsale.controller";

const router = express.Router();

router.get("/", FlashSaleController.flashSaleProducts);

export const FlashSaleRoutes = router;
