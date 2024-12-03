import { Shop } from "@prisma/client";
import prisma from "../../utils/prisma";
import AppError from "../../error/AppError";
import httpStatus from "http-status";

const createShopIntoDB = async (shop: Shop, userId: string) => {
  const isShopExist = await prisma.shop.findUnique({
    where: {
      owner: userId,
    },
  });

  if (isShopExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "Shop already exists");
  }

  const result = await prisma.shop.create({
    data: {
      ...shop,
      owner: userId,
    },
  });

  return result;
};

const getShopUserFromDB = async (userId: string) => {
  const result = await prisma.shop.findUnique({
    where: {
      owner: userId,
    },
  });

  return result;
};
const updateShopFromDB = async (userId: string, payload: Partial<Shop>) => {
  const isShopExist = await prisma.shop.findUnique({
    where: {
      owner: userId,
    },
  });
  if (!isShopExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "Shop not found");
  }
  const result = await prisma.shop.update({
    where: {
      id: isShopExist.id,
    },
    data: {
      ...payload,
    },
  });
  return result;
};
const followShopFromDB = async (userId: string, shopId: string) => {
  const isShopExist = await prisma.shop.findUnique({
    where: {
      id: shopId,
    },
  });
  if (!isShopExist) {
    const shopData = await prisma.shopFollower.deleteMany({
      where: {
        userId: userId,
        shopId: shopId,
      },
    });
    return shopData;
  }
  const alreadyFollowed = await prisma.shopFollower.findFirst({
    where: {
      userId: userId,
      shopId: shopId,
    },
  });
  if (alreadyFollowed) {
    throw new AppError(httpStatus.BAD_REQUEST, "Already followed");
  }
  const result = await prisma.shopFollower.create({
    data: {
      userId: userId,
      shopId: shopId,
    },
  });
  return result;
};
const unfollowShopFromDB = async (userId: string, shopId: string) => {
  const isShopExist = await prisma.shop.findUnique({
    where: {
      id: shopId,
    },
  });
  if (!isShopExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "Shop not found");
  }
  const alreadyFollowed = await prisma.shopFollower.findFirst({
    where: {
      userId: userId,
      shopId: shopId,
    },
  });
  if (!alreadyFollowed) {
    throw new AppError(httpStatus.BAD_REQUEST, "Not followed yet");
  }
  const result = await prisma.shopFollower.delete({
    where: {
      id: alreadyFollowed.id,
    },
  });
  return result;
};
const userFollowedShopFromDB = async (userId: string, shopId: string) => {
  const count = await prisma.shopFollower.count({
    where: {
      shopId: shopId,
    },
  });
  const result = await prisma.shopFollower.findFirst({
    where: {
      userId: userId,
      shopId: shopId,
    },
  });
  return {
    count,
    result,
  };
};
const shopFollowedCountFromDB = async (shopId: string, userId: string) => {
  const result = await prisma.shopFollower.count({
    where: {
      shopId: shopId,
      userId: userId,
    },
  });
  return result;
};

export const ShopServices = {
  createShopIntoDB,
  getShopUserFromDB,
  updateShopFromDB,
  followShopFromDB,
  unfollowShopFromDB,
  userFollowedShopFromDB,
  shopFollowedCountFromDB,
};
