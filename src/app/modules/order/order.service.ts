import prisma from "../../utils/prisma";
import { Order } from "@prisma/client";
import httpStatus from "http-status";
import AppError from "../../error/AppError";
import { paginationHelper } from "../../utils/paginationHelper";

const createOrderIntoDB = async (
  userId: string,
  payload: Partial<Order & { couponCode?: string }>
) => {
  const product = await prisma.product.findUnique({
    where: { id: payload.productId },
  });

  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, "Product not found");
  }

  if (!payload.quantity || payload.quantity <= 0) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid quantity requested");
  }

  if (product.stock < payload.quantity) {
    throw new AppError(httpStatus.BAD_REQUEST, "Insufficient product stock");
  }

  let totalAmount = product.price * payload.quantity;

  if (payload.couponCode) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: payload.couponCode },
    });

    if (!coupon || !coupon.isActive) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Invalid or expired coupon code"
      );
    }

    if (coupon.minimumSpend && totalAmount < coupon.minimumSpend) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Coupon requires a minimum spend of ${coupon.minimumSpend}`
      );
    }

    if (coupon.productId && coupon.productId !== product.id) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "This coupon is not applicable for the selected product"
      );
    }

    // Apply the discount
    if (coupon.discountType === "PERCENTAGE") {
      totalAmount -= (totalAmount * coupon.discountValue) / 100;
    } else if (coupon.discountType === "FIXED") {
      totalAmount -= coupon.discountValue;
    } else {
      throw new AppError(httpStatus.BAD_REQUEST, "Unknown discount type");
    }

    // Ensure the total amount is not negative
    totalAmount = Math.max(totalAmount, 0);
  }

  const order = await prisma.$transaction(async (transaction) => {
    await transaction.product.update({
      where: { id: product.id },
      data: { stock: product.stock - (payload.quantity ?? 0) },
    });

    return transaction.order.create({
      data: {
        userId: userId,
        productId: product.id,
        shopId: product.shopId,
        totalAmount: totalAmount,
        quantity: payload.quantity ?? 0,
        size: payload.size,
        color: payload.color,
        status: "PENDING",
        couponCode: payload.couponCode,
      },
    });
  });

  return order;
};

const getUserOrdersFromDB = async (userId: string, options: any) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);
  const totalCount = await prisma.order.count({
    where: { userId },
  });
  const result = await prisma.order.findMany({
    where: { userId },
    include: {
      product: {
        include: {
          shopInfo: true,
          categoryInfo: true,
          colors: true,
          sizes: true,
        },
      },
    },
    skip,
    take: limit,
  });
  return {
    meta: {
      totalCount,
      page,
      limit,
    },
    data: result,
  };
};

const getOrderVendorFromDB = async (userId: string, options: any) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);

  const isShopExist = await prisma.shop.findUnique({
    where: { owner: userId },
  });
  if (!isShopExist) {
    throw new AppError(httpStatus.NOT_FOUND, "Shop not found");
  }
  const result = await prisma.order.findMany({
    where: { shopId: isShopExist.id },
    include: {
      product: {
        include: {
          shopInfo: true,
          categoryInfo: true,
          colors: true,
          sizes: true,
        },
      },
      userinfo: true,
    },
    skip,
    take: limit, // Use Prisma's take for limit
    orderBy: { createdAt: "desc" },
  });

  const totalCount = await prisma.order.count({
    where: { shopId: isShopExist.id },
  });
  return {
    meta: {
      total: totalCount,
      page,
      limit,
    },
    data: result,
  };
};

export const OrderServices = {
  createOrderIntoDB,
  getUserOrdersFromDB,
  getOrderVendorFromDB,
};
