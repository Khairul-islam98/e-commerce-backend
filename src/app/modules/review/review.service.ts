import httpStatus from "http-status";
import prisma from "../../utils/prisma";
import { Review } from "@prisma/client";
import AppError from "../../error/AppError";
import { paginationHelper } from "../../utils/paginationHelper";

const createReviewIntoDB = async (payload: Review, userId: string) => {
  const result = await prisma.review.create({
    data: {
      ...payload,
      image: Array.isArray(payload.image) ? payload.image : [payload.image],
      userId,
    },
  });
  return result;
};

const getReviewsProductFromDB = async (productId: string) => {
  const result = await prisma.review.findMany({
    where: {
      productId,
    },
    include: {
      userinfo: true,
      product: true,
      ReviewReply: {
        include: {
          shop: {
            include: {
              userId: true,
            },
          },
        },
      },
    },
  });
  return result;
};

const createReplayReviewIntoDB = async (
  payload: { reviewId: string; content: string },
  userId: string
) => {
  const isShopExist = await prisma.shop.findUnique({
    where: { owner: userId },
    select: { id: true },
  });
  if (!isShopExist) {
    throw new AppError(httpStatus.NOT_FOUND, "Shop not found");
  }

  const result = await prisma.$transaction(async (transactionClient) => {
    const reviewExist = await transactionClient.review.findUnique({
      where: {
        id: payload.reviewId, // This needs to be a valid ReviewId
      },
    });

    if (!reviewExist) {
      throw new AppError(httpStatus.BAD_REQUEST, "Review not found");
    }

    const replayreview = await transactionClient.reviewReply.create({
      data: {
        reviewId: payload.reviewId,
        content: payload.content,
        shopId: isShopExist.id,
      },
    });

    await transactionClient.review.update({
      where: {
        id: payload.reviewId,
      },
      data: {
        reply: true,
      },
    });

    return replayreview;
  });

  return result;
};

const getMyShopReviewsFromDB = async (userId: string, options: any) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);

  const isShopExist = await prisma.shop.findUnique({
    where: { owner: userId },
    select: { id: true },
  });
  if (!isShopExist) {
    throw new AppError(httpStatus.NOT_FOUND, "Shop not found");
  }
  const result = await prisma.review.findMany({
    where: {
      product: {
        shopId: isShopExist.id,
      },
    },
    include: {
      userinfo: true,
      product: true,
    },
    skip,
    take: limit,
    orderBy: {
      createdAt: "desc",
    },
  });
  const totalCount = await prisma.review.count({
    where: {
      product: {
        shopId: isShopExist.id,
      },
    },
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

export const ReviewService = {
  createReviewIntoDB,
  getReviewsProductFromDB,
  createReplayReviewIntoDB,
  getMyShopReviewsFromDB,
};
