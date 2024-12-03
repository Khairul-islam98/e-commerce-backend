import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { UserService } from "./user.service";
import httpStatus from "http-status";
import { Request } from "express";

const getUser = catchAsync(async (req: Request & { user?: any }, res) => {
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

export const UserController = {
  getUser,
  updateUser,
};
