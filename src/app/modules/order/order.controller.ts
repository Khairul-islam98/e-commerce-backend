import catchAsync from "../../utils/catchAsync";
import { OrderServices } from "./order.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { Request } from "express";
import pick from "../../utils/pick";

const createOrder = catchAsync(async (req: Request & { user?: any }, res) => {
  const order = await OrderServices.createOrderIntoDB(req.user.id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Order created successfully",
    data: order,
  });
});
const getUserOrders = catchAsync(async (req: Request & { user?: any }, res) => {
  const options = pick(req.query, ["limit", "page", "total", "orderBy"]);
  const result = await OrderServices.getUserOrdersFromDB(req.user.id, options);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Orders user retrieved successfully",
    meta: {
      page: result.meta.page,
      limit: result.meta.limit,
      total: result.meta.totalCount,
    },
    data: result.data,
  });
});

const getOrderVendor = catchAsync(
  async (req: Request & { user?: any }, res) => {
    const options = pick(req.query, [
      "limit",
      "page",
      "total",
      "skip",
      "orderBy",
    ]);
    const result = await OrderServices.getOrderVendorFromDB(
      req.user.id,
      options
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Orders vendor retrieved successfully",
      meta: {
        page: result.meta.page,
        limit: result.meta.limit,
        total: result.meta.total,
      },
      data: result.data,
    });
  }
);

export const OrderController = {
  createOrder,
  getUserOrders,
  getOrderVendor,
};
