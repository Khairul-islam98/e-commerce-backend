import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { Request } from "express";

import { AuthServices } from "./auth.service";
import config from "../../config";

const createAccount = catchAsync(async (req, res) => {
  const result = await AuthServices.createAccountIntoDB({
    ...JSON.parse(req.body.data),
    profilePhoto: req.file?.path,
  });
  const { accessToken, refreshToken } = result;
  res
    .cookie("accessToken", accessToken, {
      sameSite: config.env === "production" ? "none" : "strict",
      maxAge: 1000 * 60 * 60,
      httpOnly: true,
      secure: config.env === "production",
    })
    .cookie("refreshToken", refreshToken, {
      sameSite: config.env === "production" ? "none" : "strict",
      maxAge: 1000 * 24 * 60 * 60 * 30,
      httpOnly: true,
      secure: config.env === "production",
    });
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "User created successfully",
    data: result,
  });
});

const loginUser = catchAsync(async (req, res) => {
  const result = await AuthServices.loginUser(req.body);
  const { accessToken, refreshToken } = result;
  res
    .cookie("accessToken", accessToken, {
      sameSite: config.env === "production" ? "none" : "strict",
      maxAge: 1000 * 60 * 60,
      httpOnly: true,
      secure: config.env === "production",
    })
    .cookie("refreshToken", refreshToken, {
      sameSite: config.env === "production" ? "none" : "strict",
      maxAge: 1000 * 24 * 60 * 60 * 30,
      httpOnly: true,
      secure: config.env === "production",
    });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User logged in successfully",
    data: result,
  });
});
const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;
  const result = await AuthServices.refreshToken(refreshToken);
  res.cookie("accessToken", result.accessToken, {
    sameSite: config.env === "production" ? "none" : "strict",
    maxAge: 1000 * 60 * 60, // 1 hour
    httpOnly: true,
    secure: config.env === "production",
  });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Logged in successfully!",
    data: result,
  });
});

const changePassword = catchAsync(
  async (req: Request & { user?: any }, res) => {
    const user = req.user;
    const result = await AuthServices.changepassword(user, req.body);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Password Changed successfully!",
      data: result,
    });
  }
);

const forgetPassword = catchAsync(async (req, res) => {
  const result = await AuthServices.forgetPassword(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password reset link sent successfully!",
    data: result,
  });
});
const resetPassword = catchAsync(async (req, res) => {
  await AuthServices.resetPassword(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password reset successfully!",
  });
});

export const AuthController = {
  createAccount,
  loginUser,
  refreshToken,
  changePassword,
  forgetPassword,
  resetPassword,
};
