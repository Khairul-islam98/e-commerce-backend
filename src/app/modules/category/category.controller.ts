import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { CategoryService } from "./category.service";
import httpStatus from "http-status";

const createCategory = catchAsync(async (req, res) => {
  const result = await CategoryService.createCategoryIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Category created successfully",
    data: result,
  });
});
const getAllCategories = catchAsync(async (req, res) => {
  console.log(req.query);
  const result = await CategoryService.getAllCategories(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    data: result,
  });
});
const getCategoryById = catchAsync(async (req, res) => {
  const result = await CategoryService.getCategoryById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    data: result,
  });
});
const updateCategory = catchAsync(async (req, res) => {
  const { categoryId } = req.params;
  const result = await CategoryService.updateCategory(categoryId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Category updated successfully",
    data: result,
  });
});
const deleteCategory = catchAsync(async (req, res) => {
  const { categoryId } = req.params;
  await CategoryService.deleteCategory(categoryId);
  sendResponse(res, {
    statusCode: httpStatus.NO_CONTENT,
    success: true,
    message: "Category deleted successfully",
  });
});

export const CategoryController = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
