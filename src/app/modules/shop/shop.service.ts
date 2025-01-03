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
    include: {
      products: {
        where: {
          isDeleted: false,
        },
      },
      followers: true,
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
    const shop = await prisma.shop.create({
      data: {
        name: payload.name || "",
        description: payload.description,
        logo: payload.logo || "",
        owner: userId,
      },
    });
    return shop;
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
    include: {
      followers: true,
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
    const result = await prisma.shopFollower.deleteMany({
      where: {
        userId: userId,
        shopId: shopId,
      },
    });

    return result;
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

const getShopById = async (shopId: string, userId: string) => {
  const shop = await prisma.shop.findUnique({
    where: {
      id: shopId,
    },
    include: {
      followers: true,
    },
  });

  if (!shop) {
    throw new AppError(404, "Shop not found");
  }
  const isFollowing = await prisma.shopFollower.findFirst({
    where: {
      userId: userId,
      shopId: shopId,
    },
  });
  const followerCount = await prisma.shopFollower.count({
    where: {
      shopId: shopId,
    },
  });
  const totalProduct = await prisma.product.count({
    where: {
      shopId: shopId,
    },
  });

  return {
    ...shop,
    followerCount,
    totalProduct,
    isFollowing: Boolean(isFollowing),
  };
};

const getPrioritizedProductsFromFollowedShops = async (
  userId: string,
  options: any,
  limit: number
) => {
  // Fetch followed shops
  const followed = await prisma.shopFollower.findMany({
    where: {
      userId: userId,
    },
    select: {
      shopId: true,
    },
  });

  console.log("Followed shops:", followed); // Debugging

  const shopIds = followed.map((shopFollower) => shopFollower.shopId);

  // Check if there are followed shops
  if (shopIds.length === 0) {
    console.log("No followed shops found for user:", userId);
    return {
      data: [],
      meta: { page: options.page, limit, total: 0, totalPage: 0 },
    };
  }

  // Fetch products from followed shops
  const products = await prisma.product.findMany({
    where: {
      shopId: { in: shopIds },
      isDeleted: false,
    },
    skip: 0,
    take: limit,
    include: {
      shopInfo: true,
      categoryInfo: true,
    },
  });

  console.log("Products from followed shops:", products); // Debugging

  if (products.length === 0) {
    return {
      data: [],
      meta: { page: options.page, limit, total: 0, totalPage: 0 },
    };
  }

  // Return products
  return {
    data: products,
    meta: {
      page: options.page,
      limit,
      total: products.length, // Adjust total count
      totalPage: Math.ceil(products.length / limit),
    },
  };
};

export const ShopServices = {
  createShopIntoDB,
  getShopUserFromDB,
  updateShopFromDB,
  followShopFromDB,
  unfollowShopFromDB,
  userFollowedShopFromDB,
  shopFollowedCountFromDB,
  getShopById,
  getPrioritizedProductsFromFollowedShops,
};
