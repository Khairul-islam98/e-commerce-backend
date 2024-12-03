import httpStatus from "http-status";
import prisma from "../../utils/prisma";
import { Review } from "@prisma/client";
import AppError from "../../error/AppError";

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
    },
  });
  return result;
};

const createReplayReviewIntoDB = async (payload: Review, userId: string) => {
  const result = await prisma.$transaction(async (transationClient) => {
    const reviewExist = await transationClient.review.findUnique({
      where: {
        id: payload.id,
      },
    });
    if (!reviewExist) {
      throw new AppError(httpStatus.BAD_REQUEST, "Review not found");
    }
    const replayreview = await transationClient.review.create({
      data: {
        ...payload,
        userId,
      },
    });
    return replayreview;
  });
  return result;
};

export const ReviewService = {
  createReviewIntoDB,
  getReviewsProductFromDB,
  createReplayReviewIntoDB,
};
