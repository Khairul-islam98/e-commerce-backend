import AppError from "../../error/AppError";
import prisma from "../../utils/prisma";

const flashSaleProducts = async (query: Record<string, any>) => {
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 10);

  const products = await prisma.product.findMany({
    where: {
      isDeleted: false,
      discount: { gt: 0 },
    },
    include: {
      shopInfo: true,
      categoryInfo: true,
      colors: true,
      sizes: true,
    },
    orderBy: {
      discount: "desc",
    },
    skip: (page - 1) * limit,
    take: limit,
  });

  const totalCount = await prisma.product.count({
    where: {
      isDeleted: false,
      discount: { gt: 0 },
    },
  });

  return { products, totalCount };
};

export const FlashSaleServices = {
  flashSaleProducts,
};
