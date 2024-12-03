import { Prisma, Product } from "@prisma/client";
import prisma from "../../utils/prisma";
import AppError from "../../error/AppError";
import httpStatus from "http-status";
import { paginationHelper } from "../../utils/paginationHelper";
import { productSearchableFields } from "./product.constant";

const createProductIntoDB = async (
  payload: Product & {
    colors?: Array<{ name: string; value: string }>;
    sizes?: Array<{ name: string; value: string }>;
  }
) => {
  const result = await prisma.product.create({
    data: {
      ...payload,
      image: Array.isArray(payload.image) ? payload.image : [payload.image],
      sizes: {
        create: payload.sizes?.map((size) => ({
          name: size.name,
          value: size.value,
        })),
      },
      colors: {
        create: payload.colors?.map((color) => ({
          name: color.name,
          value: color.value,
        })),
      },
    },
  });

  return result;
};
const duplicateProduct = async (payload: Product, userId: string) => {
  const isProductExist = await prisma.product.findUnique({
    where: {
      id: payload.id,
    },
    include: {
      colors: true,
      shopInfo: true,
      sizes: true,
    },
  });
  if (!isProductExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "Product not found");
  }
  if (isProductExist.shopInfo.owner !== userId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You are not the owner of this product"
    );
  }
  const result = await prisma.product.create({
    data: {
      ...payload,
      shopId: isProductExist.shopId,
      sizes: {
        create: isProductExist.sizes.map((size) => ({
          name: size.name,
          value: size.value,
        })),
      },
      colors: {
        create: isProductExist.colors.map((color) => ({
          name: color.name,
          value: color.value,
        })),
      },
    },
  });
  return result;
};
const updateProductFromDB = async (
  payload: Product & {
    colors: Array<{
      id?: string;
      name: string;
      value: string;
      sizes: Array<{
        id?: string;
        name: string;
        value: string;
        quantity: number;
      }>;
    }>;
  },
  productId: string,
  userId: string
) => {
  const isProductExist = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      colors: true,
      shopInfo: true,
      sizes: true,
    },
  });

  if (!isProductExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "Product not found");
  }

  if (isProductExist.shopInfo.owner !== userId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You are not the owner of this product"
    );
  }

  const result = await prisma.product.update({
    where: { id: productId },
    data: {
      name: payload.name,
      price: payload.price,
      stock: payload.stock,
      description: payload.description,
      image: payload.image,
      categoryId: payload.categoryId,
      colors: {
        deleteMany: {},
        create: payload.colors.map((color) => ({
          name: color.name,
          value: color.value,
          sizes: {
            create: color.sizes.map((size) => ({
              name: size.name,
              value: size.value,
            })),
          },
        })),
      },
    },
    include: {
      colors: true,
      sizes: true,
    },
  });

  return result;
};
const deleteProductById = async (productId: string, userId: string) => {
  const isProductExist = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      shopInfo: true,
    },
  });

  if (!isProductExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "Product not found");
  }

  if (isProductExist.shopInfo.owner !== userId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You are not the owner of this product"
    );
  }

  const result = await prisma.product.update({
    where: { id: productId },
    data: {
      isDeleted: true,
    },
  });

  return result;
};

const getAllProductsFromDB = async (
  params: {
    searchTerm?: string;
    minPrice?: string | number;
    maxPrice?: string | number;
    [key: string]: any;
  },
  options: any
) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, minPrice, maxPrice, ...filterData } = params;

  const andCondition: Prisma.ProductWhereInput[] = [];

  // Search condition
  if (searchTerm) {
    andCondition.push({
      OR: productSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  // Price filtering conditions
  const priceCondition: Prisma.ProductWhereInput = {};

  if (minPrice && maxPrice) {
    priceCondition.price = {
      gte: Number(minPrice),
      lte: Number(maxPrice),
    };
  } else if (minPrice) {
    priceCondition.price = { gte: Number(minPrice) };
  } else if (maxPrice) {
    priceCondition.price = { lte: Number(maxPrice) };
  }

  if (Object.keys(priceCondition).length > 0) {
    andCondition.push(priceCondition);
  }

  if (Object.keys(filterData).length > 0) {
    andCondition.push({
      AND: Object.entries(filterData).map(([field, value]) => ({
        [field]: value,
      })),
    });
  }

  const whereCondition: Prisma.ProductWhereInput = {
    isDeleted: false,
    ...(andCondition.length > 0 ? { AND: andCondition } : {}),
  };

  const result = await prisma.product.findMany({
    where: whereCondition,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: "desc" },
    include: {
      shopInfo: true,
      categoryInfo: true,
      colors: true,
      sizes: true,
    },
  });

  const total = await prisma.product.count({ where: whereCondition });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getProductById = async (id: string) => {
  const result = await prisma.product.findUnique({
    where: {
      id,
      isDeleted: false,
    },
    include: {
      shopInfo: true,
      categoryInfo: true,
      colors: true,
      sizes: true,
    },
  });
  return result;
};

const getProductByCategoryId = async (categoryId: string) => {
  const productLimit = 5;
  const categoryProducts = await prisma.product.findMany({
    where: { categoryId, isDeleted: false },
    include: {
      colors: true,
      sizes: true,
      shopInfo: true,
    },
    take: productLimit,
  });

  if (categoryProducts.length < productLimit) {
    const additionalProducts = await prisma.product.findMany({
      where: {
        isDeleted: false,
        NOT: { id: { in: categoryProducts.map((p) => p.id) } },
      },
      include: {
        colors: true,
        sizes: true,
        shopInfo: true,
      },
      take: productLimit - categoryProducts.length,
    });

    return [...categoryProducts, ...additionalProducts];
  }
};
const getShopFollwer = async (userId: string, limit: number) => {
  const followed = await prisma.shopFollower.findMany({
    where: {
      userId: userId,
    },
    select: {
      shopId: true,
    },
  });

  const shopIds = followed.map((shopFollower) => shopFollower.shopId);

  if (shopIds.length === 0) {
    return [];
  }

  const products = await prisma.product.findMany({
    where: {
      shopId: { in: shopIds },
      isDeleted: false,
    },
    skip: 0,
    take: limit,
  });

  const result = products.sort(() => 0.5 - Math.random());
  return result;
};

export const ProductServices = {
  createProductIntoDB,
  duplicateProduct,
  updateProductFromDB,
  deleteProductById,
  getAllProductsFromDB,
  getProductById,
  getProductByCategoryId,
  getShopFollwer,
};
