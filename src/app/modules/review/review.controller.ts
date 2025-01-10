import httpStatus from "http-status";
import { ReviewService } from "./review.service";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { Request } from "express";
import pick from "../../utils/pick";

const createReview = catchAsync(async (req: Request & { user?: any }, res) => {
  const parsedData = JSON.parse(req.body.data);
  console.log({ parsedData });
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

const getMyShopReviews = catchAsync(
  async (req: Request & { user?: any }, res) => {
    console.log(req.user);
    const options = pick(req.query, ["limit", "page", "total", "orderBy"]);
    const result = await ReviewService.getMyShopReviewsFromDB(
      req.user.id,
      options
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Reviews vendor retrieved successfully",
      meta: {
        page: result.meta.page,
        limit: result.meta.limit,
        total: result.meta.totalCount,
      },
      data: result.data,
    });
  }
);

export const ReviewController = {
  createReview,
  getReviewsProduct,
  createReplayReview,
  getMyShopReviews,
};
