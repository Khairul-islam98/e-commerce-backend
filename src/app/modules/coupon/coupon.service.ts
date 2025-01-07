import { Coupon } from "@prisma/client";
import prisma from "../../utils/prisma";
import httpStatus from "http-status";
import AppError from "../../error/AppError";

const createCoupon = async (payload: Coupon) => {
  const product = await prisma.product.findUnique({
    where: { id: payload.productId },
  });

  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, "Product not found");
  }
  const coupon = await prisma.coupon.create({
    data: payload,
  });

  return coupon;
};

const getCoupone = async () => {
  const coupon = await prisma.coupon.findMany();

  return coupon;
};

const getCouponByProductId = async (productId: string) => {
  const coupon = await prisma.coupon.findMany({
    where: { productId },
  });

  return coupon;
};

export const CouponServices = {
  createCoupon,
  getCoupone,
  getCouponByProductId,
};
