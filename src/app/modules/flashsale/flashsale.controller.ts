import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { FlashSaleServices } from "./flashsale.service";

const flashSaleProducts = catchAsync(async (req, res) => {
  const { products, totalCount } = await FlashSaleServices.flashSaleProducts(
    req.query
  );
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Products flash successfully",
    data: products,
    meta: {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
      total: totalCount,
    },
  });
});

export const FlashSaleController = {
  flashSaleProducts,
};
