import httpStatus from "http-status";
import { ReviewService } from "./review.service";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { Request } from "express";

const createReview = catchAsync(async (req: Request & { user?: any }, res) => {
  const parsedData = JSON.parse(req.body.data);
  const images = (req.files as Express.Multer.File[])?.map((file) => file.path);
  const result = await ReviewService.createReviewIntoDB(
    {
      ...parsedData,
      image: images,
    },
    req.user.id
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Review created successfully",
    data: result,
  });
});

const getReviewsProduct = catchAsync(async (req, res) => {
  const { productId } = req.params;
  const result = await ReviewService.getReviewsProductFromDB(productId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Reviews fetched successfully",
    data: result,
  });
});

const createReplayReview = catchAsync(
  async (req: Request & { user?: any }, res) => {
    const result = await ReviewService.createReplayReviewIntoDB(
      req.body,
      req.user.id
    );
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Replay review created successfully",
      data: result,
    });
  }
);

export const ReviewController = {
  createReview,
  getReviewsProduct,
  createReplayReview,
};
