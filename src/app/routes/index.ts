import express from "express";
import { AuthRoutes } from "../modules/auth/auth.route";
import { ProductRoutes } from "../modules/product/product.route";
import { ShopRoutes } from "../modules/shop/shop.route";
import { OrderRoutes } from "../modules/order/order.route";
import { ReviewRoutes } from "../modules/review/review.route";
import { CategoryRoutes } from "../modules/category/category.route";
import { UserRoutes } from "../modules/user/user.route";
import { PaymentRoutes } from "../modules/payment/payment.route";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/user",
    route: UserRoutes,
  },
  {
    path: "/category",
    route: CategoryRoutes,
  },
  {
    path: "/product",
    route: ProductRoutes,
  },
  {
    path: "/shop",
    route: ShopRoutes,
  },
  {
    path: "/order",
    route: OrderRoutes,
  },
  {
    path: "/review",
    route: ReviewRoutes,
  },
<<<<<<< HEAD
  {
    path: "/payment",
    route: PaymentRoutes,
  },
=======
>>>>>>> e76c5e9c4d0760c45854c3725542816bfbd17622
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
