import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { UserService } from "./user.service";
import httpStatus from "http-status";
import { Request } from "express";
import pick from "../../utils/pick";

const getUser = catchAsync(async (req: Request & { user?: any }, res) => {
  console.log(req.user.id);
  const result = await UserService.getUserFromDB(req.user.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User fetched successfully",
    data: result,
  });
});

const updateUser = catchAsync(async (req: Request & { user?: any }, res) => {
  const result = await UserService.updateUserFromDB(
    {
      ...JSON.parse(req.body.data),
      profilePhoto: req.file?.path,
    },
    req.user.id
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User Update successfully",
    data: result,
  });
});

const getAllUsers = catchAsync(async (req: Request, res) => {
  const option = pick(req.query, [
    "limit",
    "page",
    "sortBy",
    "sortOrder",
    "total",
  ]);
  const result = await UserService.getAllUsersFromDB(req.query, option);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const userStatusChange = catchAsync(async (req: Request, res) => {
  const { userId } = req.params;
  const result = await UserService.userStatueChange(userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User status changed successfully",
    data: result,
  });
});

const getAllShop = catchAsync(async (req: Request, res) => {
  const option = pick(req.query, [
    "limit",
    "page",
    "sortBy",
    "sortOrder",
    "total",
  ]);
  const result = await UserService.getAllShopFromDB(req.query, option);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Shops retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const createBlacklistShop = catchAsync(async (req: Request, res) => {
  const result = await UserService.createBlacklistShopFromDB(req.params.shopId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Shop blacklist status changed successfully",
    data: result,
  });
});
const totalTransactionsHistory = catchAsync(async (req: Request, res) => {
  const option = pick(req.query, [
    "limit",
    "page",
    "sortBy",
    "sortOrder",
    "total",
    "searchTerm",
  ]);
  const result = await UserService.totalTransactionsHistoryFromDB(
    req.query,
    option
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Transactions history retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getOverview = catchAsync(async (req: Request, res) => {
  const result = await UserService.getOverviewFromDB();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Overview retrieved successfully",
    data: result,
  });
});
const getMonthlyTransactionOfCurrentYear = catchAsync(
  async (req: Request, res) => {
    const result = await UserService.getMonthlyTransactionOfCurrentYear();
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Monthly transaction of current year retrieved successfully",
      data: result,
    });
  }
);

const getMonthlyReviewOfCurrentYear = catchAsync(async (req: Request, res) => {
  const result = await UserService.getMonthlyReviewOfCurrentYear();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Monthly review of current year retrieved successfully",
    data: result,
  });
});

export const UserController = {
  getUser,
  updateUser,
  getAllUsers,
  userStatusChange,
  getAllShop,
  createBlacklistShop,
  totalTransactionsHistory,
  getOverview,
  getMonthlyTransactionOfCurrentYear,
  getMonthlyReviewOfCurrentYear,
};
