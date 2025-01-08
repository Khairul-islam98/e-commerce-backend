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
  const shop = await prisma.shop.findUnique({
    where: {
      id: payload.shopId,
      isBlacklist: false,
    },
  });
  if (!shop) {
    throw new AppError(httpStatus.BAD_REQUEST, "Shop is blacklisted");
  }

  const result = await prisma.product.create({
    data: {
      ...payload,
      image: Array.isArray(payload.image) ? payload.image : [payload.image],
      // image: {
      //   set: Array.isArray(payload.image)
      //     ? payload.image.filter((img) => img) // Filter out undefined
      //     : [payload.image].filter((img) => img !== undefined), // Handle single value
      // },
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

const duplicateProduct = async (productId: string, userId: string) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      colors: true,
      sizes: true,
      shopInfo: true,
    },
  });

  if (!product) {
    throw new AppError(404, "Product not found");
  }

  if (product.shopInfo.owner !== userId) {
    throw new AppError(403, "You are not authorized to duplicate this product");
  }

  const newProduct = await prisma.product.create({
    data: {
      name: product.name,
      price: product.price,
      discount: product.discount,

      description: product.description,
      image: product.image,
      categoryId: product.categoryId,
      shopId: product.shopId,
      sizes: {
        create: product.sizes.map((size) => ({
          name: size.name,
          value: size.value,
        })),
      },
      colors: {
        create: product.colors.map((color) => ({
          name: color.name,
          value: color.value,
        })),
      },
    },
  });

  return newProduct;
};

const updateProductFromDB = async (
  payload: Product & {
    colors?: Array<{ id?: string; name: string; value: string }>;
    sizes?: Array<{ id?: string; name: string; value: string }>;
    image?: string | string[];
    removeImageIndex?: number | number[]; // Support both single index and array of indices
    coupons?: Array<{
      id?: string;
      code: string;
      discountType: string;
      discountValue: number;
      isActive?: boolean;
      minimumSpend?: number;
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
      coupon: true,
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

  const updateData: any = {};

  // Update other product fields
  if (payload.name) updateData.name = payload.name;
  if (payload.price) updateData.price = payload.price;
  if (payload.stock) updateData.stock = payload.stock;
  if (payload.description) updateData.description = payload.description;
  if (payload.categoryId) updateData.categoryId = payload.categoryId;

  // Handle colors
  if (payload.colors) {
    updateData.colors = {
      deleteMany: {
        id: {
          notIn: payload.colors
            .filter((color) => color.id)
            .map((color) => color.id),
        },
      },
      upsert: payload.colors.map((color) => ({
        where: { id: color.id || "" },
        create: { name: color.name, value: color.value },
        update: { name: color.name, value: color.value },
      })),
    };
  }

  // Handle sizes
  if (payload.sizes) {
    updateData.sizes = {
      deleteMany: {
        id: {
          notIn: payload.sizes.filter((size) => size.id).map((size) => size.id),
        },
      },
      upsert: payload.sizes.map((size) => ({
        where: { id: size.id || "" },
        create: { name: size.name, value: size.value },
        update: { name: size.name, value: size.value },
      })),
    };
  }

  // Normalize existing images to an array, handling both string and array cases
  const existingImages = isProductExist.image
    ? Array.isArray(isProductExist.image)
      ? [...isProductExist.image]
      : [isProductExist.image]
    : [];

  // Normalize the payload image to an array or empty array
  const payloadImages = payload.image
    ? Array.isArray(payload.image)
      ? payload.image
      : [payload.image]
    : [];

  // Combine existing and new images
  let updatedImages = [...existingImages, ...payloadImages];

  // If specific indices are to be removed
  if (payload.removeImageIndex !== undefined) {
    const indicesToRemove = Array.isArray(payload.removeImageIndex)
      ? payload.removeImageIndex
      : [payload.removeImageIndex];

    // Sort indices in descending order to avoid shifting during removal
    indicesToRemove
      .sort((a, b) => b - a)
      .forEach((index) => {
        if (index >= 0 && index < updatedImages.length) {
          updatedImages.splice(index, 1); // Remove image at the given index
        }
      });
  }

  // Update the product with the final images
  updateData.image = updatedImages.length > 0 ? updatedImages : null;

  // Handle coupons
  if (payload.coupons) {
    updateData.coupon = {
      deleteMany: {
        id: {
          notIn: payload.coupons
            .filter((coupon) => coupon.id)
            .map((coupon) => coupon.id),
        },
      },
      upsert: payload.coupons.map((coupon) => ({
        where: { id: coupon.id || "" },
        create: {
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          isActive: coupon.isActive ?? true,
          minimumSpend: coupon.minimumSpend,
        },
        update: {
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          isActive: coupon.isActive ?? true,
          minimumSpend: coupon.minimumSpend,
        },
      })),
    };
  }

  const result = await prisma.product.update({
    where: { id: productId },
    data: updateData,
    include: {
      colors: true,
      sizes: true,
      coupon: true,
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
    category?: string; // Category name
    [key: string]: any;
  },
  options: any
) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, minPrice, maxPrice, category, ...filterData } = params;

  const nonFilterableFields = ["limit", "page", "sortBy", "sortOrder"];
  nonFilterableFields.forEach((field) => delete filterData[field]);

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

  // Price filtering
  const priceCondition: Prisma.ProductWhereInput = {};
  if (minPrice && maxPrice) {
    priceCondition.price = { gte: Number(minPrice), lte: Number(maxPrice) };
  } else if (minPrice) {
    priceCondition.price = { gte: Number(minPrice) };
  } else if (maxPrice) {
    priceCondition.price = { lte: Number(maxPrice) };
  }
  if (Object.keys(priceCondition).length > 0) {
    andCondition.push(priceCondition);
  }

  // Category filter by name
  // if (category) {
  //   andCondition.push({
  //     categoryInfo: {
  //       name: {
  //         contains: String(category),
  //         mode: "insensitive",
  //       },
  //     },
  //   });
  // }
  if (category) {
    if (Array.isArray(category)) {
      // Handle multiple categories
      andCondition.push({
        OR: category.map((cat) => ({
          categoryInfo: {
            name: {
              contains: String(cat),
              mode: "insensitive",
            },
          },
        })),
      });
    } else {
      // Handle a single category
      andCondition.push({
        categoryInfo: {
          name: {
            contains: String(category),
            mode: "insensitive",
          },
        },
      });
    }
  }

  // Additional filters
  if (Object.keys(filterData).length > 0) {
    andCondition.push({
      AND: Object.entries(filterData).map(([field, value]) => ({
        [field]: value,
      })),
    });
  }

  // Where condition
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
  const totalPage = Math.ceil(total / limit);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage,
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
      coupon: true,
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
      categoryInfo: true,
    },
    take: productLimit,
  });

  if (categoryProducts.length < productLimit) {
    const additionalProducts = await prisma.product.findMany({
      where: {
        isDeleted: false,
        categoryId: { not: categoryId },
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

  return categoryProducts;
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
