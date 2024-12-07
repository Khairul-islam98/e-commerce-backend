import prisma from "../../utils/prisma";

const getProductsByIds = async (ids: string[]) => {
  const products = await prisma.product.findMany({
    where: {
      id: { in: ids },
      isDeleted: false,
    },
    include: {
      shopInfo: true,
      categoryInfo: true,
      colors: true,
      sizes: true,
    },
  });
  return products;
};

export const RecentService = {
  getProductsByIds,
};
