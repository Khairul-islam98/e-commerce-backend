import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ProductServices } from "./product.service";
import httpStatus from "http-status";
import { Request } from "express";

const createProduct = catchAsync(async (req, res) => {
  const result = await ProductServices.createProductIntoDB({
    ...JSON.parse(req.body.data),
    image: req.file?.path,
  });
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Product created successfully",
    data: result,
  });
});

const duplicateProduct = catchAsync(
  async (req: Request & { user?: any }, res) => {
    const user = req.user;
    const { productId } = req.params;

    const existingProduct = await ProductServices.getProductById(productId);

    if (!existingProduct) {
      return sendResponse(res, {
        statusCode: httpStatus.NOT_FOUND,
        success: false,
        message: "Product not found",
      });
    }

    const result = await ProductServices.duplicateProduct(
      existingProduct,
      user.id
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Product duplicated successfully",
      data: result,
    });
  }
);
const updateProduct = catchAsync(async (req: Request & { user?: any }, res) => {
  const user = req.user;
  const { productId } = req.params;
  const result = await ProductServices.updateProductFromDB(
    JSON.parse(req.body.data),
    productId,
    user.id
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product updated successfully",
    data: result,
  });
});

const deleteProduct = catchAsync(async (req: Request & { user?: any }, res) => {
  const user = req.user;
  const { productId } = req.params;
  const result = await ProductServices.deleteProductById(productId, user.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product deleted successfully",
    data: result,
  });
});

const getAllProducts = catchAsync(async (req, res) => {
  const options = {
    limit: Number(req.query.limit) || 10,
    page: Number(req.query.page) || 1,
    sortBy: req.query.sortBy as string,
    sortOrder: req.query.sortOrder as string,
  };

  const result = await ProductServices.getAllProductsFromDB(req.query, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Products retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getProductById = catchAsync(async (req, res) => {
  const { productId } = req.params;
  const result = await ProductServices.getProductById(productId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product retrieved successfully",
    data: result,
  });
});

const getProductsByCategory = catchAsync(async (req, res) => {
  const { categoryId } = req.params;
  const result = await ProductServices.getProductByCategoryId(categoryId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Category products retrieved successfully",
    data: result,
  });
});

const getShopFollowerProducts = catchAsync(
  async (req: Request & { user?: any }, res) => {
    const user = req.user;
    const limit = Number(req.query.limit) || 10;
    const result = await ProductServices.getShopFollwer(user.id, limit);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Shop follower products retrieved successfully",
      data: result,
    });
  }
);

export const ProductController = {
  createProduct,
  duplicateProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  getProductsByCategory,
  getShopFollowerProducts,
};
