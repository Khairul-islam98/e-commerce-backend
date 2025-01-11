import httpStatus from "http-status";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";
import { ShopServices } from "./shop.service";
import { Request } from "express";
import pick from "../../utils/pick";

const createShop = catchAsync(async (req: Request & { user?: any }, res) => {
  const parsedData = JSON.parse(req.body.data);

  const result = await ShopServices.createShopIntoDB(
    {
      ...parsedData,
      logo: req.file?.path,
    },
    req.user.id
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Shop created successfully",
    data: result,
  });
});

const getShopUser = catchAsync(async (req: Request & { user?: any }, res) => {
  const result = await ShopServices.getShopUserFromDB(req.user.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Shop retrived successfully",
    data: result,
  });
});
const updateShop = catchAsync(async (req: Request & { user?: any }, res) => {
  const parsedData = JSON.parse(req.body.data);
  const result = await ShopServices.updateShopFromDB(req.user.id, {
    ...parsedData,
    logo: req.file?.path,
  });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Shop updated successfully",
    data: result,
  });
});
const followShop = catchAsync(async (req: Request & { user?: any }, res) => {
  const result = await ShopServices.followShopFromDB(
    req.user.id,
    req.params.shopId
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Shop followed successfully",
    data: result,
  });
});
const unfollowShop = catchAsync(async (req: Request & { user?: any }, res) => {
  const result = await ShopServices.unfollowShopFromDB(
    req.user.id,
    req.params.shopId
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Shop unfollowed successfully",
    data: result,
  });
});
const userFollowedShop = catchAsync(
  async (req: Request & { user?: any }, res) => {
    const result = await ShopServices.userFollowedShopFromDB(
      req.user.id,
      req.params.shopId
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User followed shop",
      data: result,
    });
  }
);
const shopFollowedCount = catchAsync(
  async (req: Request & { user?: any }, res) => {
    const result = await ShopServices.shopFollowedCountFromDB(
      req.params.shopId,
      req.user.id
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Shop followed count",
      data: result,
    });
  }
);

const getShopById = catchAsync(async (req: Request & { user?: any }, res) => {
  const result = await ShopServices.getShopById(req.params.shopId, req.user.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Shop retrived successfully",
    data: result,
  });
});

const getPrioritizedProducts = catchAsync(
  async (req: Request & { user?: any }, res) => {
    console.log(req.query);
    const user = req.user;
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
    const productLimit = Number(req.query.productLimit) || 10;

    console.log("Fetching prioritized products for user:", user.id);
    console.log("Options:", options);
    console.log("Product Limit:", productLimit);

    const result = await ShopServices.getPrioritizedProductsFromFollowedShops(
      user.id,
      options,
      productLimit
    );

    if (result && result.data && result.data.length === 0) {
      console.log("No products found for the followed shops.");
    }

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Prioritized products retrieved successfully",
      data: result,
    });
  }
);

export const ShopController = {
  createShop,
  getShopUser,
  updateShop,
  followShop,
  unfollowShop,
  userFollowedShop,
  shopFollowedCount,
  getShopById,
  getPrioritizedProducts,
};
