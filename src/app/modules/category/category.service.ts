import { Category } from "@prisma/client";
import prisma from "../../utils/prisma";
import AppError from "../../error/AppError";
import httpStatus from "http-status";

const createCategoryIntoDB = async (payload: Category) => {
  const isExist = await prisma.category.findFirst({
    where: {
      name: payload.name,
    },
  });
  if (isExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "Category already exist");
  }
  return await prisma.category.create({
    data: payload,
  });
};
const getAllCategories = async () => {
  return await prisma.category.findMany();
};
const getCategoryById = async (id: string) => {
  return await prisma.category.findUnique({
    where: {
      id,
    },
  });
};
const updateCategory = async (id: string, payload: Category) => {
  return await prisma.category.update({
    where: {
      id,
    },
    data: payload,
  });
};
const deleteCategory = async (id: string) => {
  return await prisma.category.delete({
    where: {
      id,
    },
  });
};

export const CategoryService = {
  createCategoryIntoDB,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
