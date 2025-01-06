import { Category, Prisma } from "@prisma/client";
import prisma from "../../utils/prisma";
import AppError from "../../error/AppError";
import httpStatus from "http-status";

const categorySearchableFields = ["name"];

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
const getAllCategories = async (params: any) => {
  const { searchTerm } = params;
  const andCondition: Prisma.CategoryWhereInput[] = [];

  // Handle single or multiple 'name' parameters
  if (searchTerm) {
    if (Array.isArray(searchTerm)) {
      andCondition.push({
        OR: searchTerm
          .map((value) =>
            categorySearchableFields.map((field) => ({
              [field]: {
                contains: value,
                mode: "insensitive",
              },
            }))
          )
          .flat(),
      });
    } else {
      andCondition.push({
        OR: categorySearchableFields.map((field) => ({
          [field]: {
            contains: searchTerm,
            mode: "insensitive",
          },
        })),
      });
    }
  }

  const whereCondition: Prisma.CategoryWhereInput =
    andCondition.length > 0 ? { AND: andCondition } : {};

  return await prisma.category.findMany({
    where: whereCondition,
  });
};

const getCategoryById = async (id: string) => {
  return await prisma.category.findUnique({
    where: {
      id,
    },
    include: {
      products: {
        include: {
          categoryInfo: true,
        },
      },
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
