import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { CouponServices } from "./coupon.service";
import httpStatus from "http-status";

const createCoupon = catchAsync(async (req, res) => {
  const coupon = await CouponServices.createCoupon(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Coupon created successfully",
    data: coupon,
  });
});

const getCoupone = catchAsync(async (req, res) => {
  const resutl = await CouponServices.getCoupone();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Coupon created successfully",
    data: resutl,
  });
});

const getCouponByProductId = catchAsync(async (req, res) => {
  const resutl = await CouponServices.getCouponByProductId(
    req.params.productId
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Coupon created successfully",
    data: resutl,
  });
});

export const CouponController = {
  createCoupon,
  getCoupone,
  getCouponByProductId,
};
