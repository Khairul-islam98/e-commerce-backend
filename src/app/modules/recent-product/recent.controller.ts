import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { RecentService } from "./recent.service";
import httpStatus from "http-status";

const getProductsByIds = catchAsync(async (req, res) => {
  const { ids } = req.body;
  const result = await RecentService.getProductsByIds(ids);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Products retrieved successfully",
    data: result,
  });
});

export const RecentController = {
  getProductsByIds,
};
