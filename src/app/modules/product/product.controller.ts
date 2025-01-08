import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ProductServices } from "./product.service";
import httpStatus from "http-status";
import { Request } from "express";
import pick from "../../utils/pick";

const createProduct = catchAsync(async (req, res) => {
  const images = (req.files as Express.Multer.File[])?.map((file) => file.path);

  const result = await ProductServices.createProductIntoDB({
    ...JSON.parse(req.body.data),
    image: images,
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
      existingProduct.id,
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
  console.log(req.params);

  const user = req.user;
  const { productId } = req.params;
  const images = (req.files as Express.Multer.File[])?.map((file) => file.path);
  const result = await ProductServices.updateProductFromDB(
    {
      ...JSON.parse(req.body.data),
      image: images,
    },
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
  const option = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const result = await ProductServices.getAllProductsFromDB(req.query, option);
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
  console.log(req.params);
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
