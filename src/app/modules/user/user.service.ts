import { Prisma, User } from "@prisma/client";
import prisma from "../../utils/prisma";
import { paginationHelper } from "../../utils/paginationHelper";

const getUserFromDB = async (id: string) => {
  const result = await prisma.user.findUnique({
    where: {
      id,
    },
  });
  return result;
};
const updateUserFromDB = async (id: string, data: Partial<User>) => {
  const result = await prisma.user.update({
    where: {
      id,
    },
    data: {
      ...data,
    },
  });
  return result;
};

const getAllUsersFromDB = async (params: any, options: any) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;

  const nonFilterableFields = ["limit", "page", "sortBy", "sortOrder"];
  nonFilterableFields.forEach((field) => delete filterData[field]);

  const andCondition: Prisma.UserWhereInput[] = [];
  if (searchTerm) {
    andCondition.push({
      OR: [
        {
          name: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
      ],
    });
  }
  if (Object.keys(filterData).length > 0) {
    andCondition.push({
      AND: Object.entries(filterData).map(([field, value]) => ({
        [field]: value,
      })),
    });
  }

  // Where condition
  const whereCondition: Prisma.UserWhereInput = {
    ...(andCondition.length > 0 ? { AND: andCondition } : {}),
  };
  const result = await prisma.user.findMany({
    where: whereCondition,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: "desc" },
  });
  const total = await prisma.user.count({ where: whereCondition });
  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const userStatueChange = async (userId: string, payload: User) => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  if (!isUserExist) {
    throw new Error("User not found");
  }
  const result = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      ...payload,
    },
  });
  return result;
};

const getAllShopFromDB = async (params: any, options: any) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;

  const nonFilterableFields = ["limit", "page", "sortBy", "sortOrder"];
  nonFilterableFields.forEach((field) => delete filterData[field]);
  const andCondition: Prisma.ShopWhereInput[] = [];
  if (searchTerm) {
    andCondition.push({
      OR: [
        {
          name: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
      ],
    });
  }
  if (Object.keys(filterData).length > 0) {
    andCondition.push({
      AND: Object.entries(filterData).map(([field, value]) => ({
        [field]: value,
      })),
    });
  }
  const whereCondition: Prisma.ShopWhereInput = {
    ...(andCondition.length > 0 ? { AND: andCondition } : {}),
  };
  const result = await prisma.shop.findMany({
    where: whereCondition,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: "desc" },
  });
  const total = await prisma.shop.count({ where: whereCondition });
  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const createBlacklistShopFromDB = async (shopId: string) => {
  const isShopExist = await prisma.shop.findUnique({
    where: {
      id: shopId,
    },
  });
  if (!isShopExist) {
    throw new Error("Shop not found");
  }
  const result = await prisma.shop.update({
    where: {
      id: shopId,
    },
    data: {
      isBlacklist: !isShopExist.isBlacklist,
    },
  });
  return result;
};
const totalTransactionsHistoryFromDB = async (params: any, options: any) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;

  const nonFilterableFields = ["limit", "page", "sortBy", "sortOrder"];
  nonFilterableFields.forEach((field) => delete filterData[field]);

  const andCondition: Prisma.PaymentWhereInput[] = [];

  if (searchTerm) {
    andCondition.push({
      OR: [
        {
          userinfo: {
            email: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        },
        {
          transactionId: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  // Handle additional filter data
  if (Object.keys(filterData).length > 0) {
    andCondition.push({
      AND: Object.entries(filterData).map(([field, value]) => ({
        [field]: value,
      })),
    });
  }

  // Construct the where condition
  const whereCondition: Prisma.PaymentWhereInput = {
    ...(andCondition.length > 0 ? { AND: andCondition } : {}),
  };

  // Perform the query with pagination and sorting
  const result = await prisma.payment.findMany({
    where: whereCondition,
    skip,
    take: limit,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      userinfo: true, // Include userinfo if needed
    },
  });

  const total = await prisma.payment.count({
    where: whereCondition,
  });

  console.log({ result });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getOverviewFromDB = async () => {
  const totalUsers = await prisma.user.count({
    where: {
      role: "CUSTOMER",
    },
  });
  const totalVendors = await prisma.user.count({
    where: {
      role: "VENDOR",
    },
  });
  const totalShops = await prisma.shop.count();
  const totalPayments = await prisma.payment.count({
    where: {
      status: "SUCCESS",
    },
  });
  return {
    totalUsers,
    totalVendors,
    totalShops,
    totalPayments,
  };
};
const getMonthlyTransactionOfCurrentYear = async () => {
  const currentYear = new Date().getFullYear();

  // Fetch successful transactions grouped by month
  const transactions = await prisma.payment.groupBy({
    by: ["status", "createdAt"],
    where: {
      status: "SUCCESS",
      createdAt: {
        gte: new Date(`${currentYear}-01-01`),
        lt: new Date(`${currentYear + 1}-01-01`),
      },
    },
    _sum: {
      amount: true,
    },
  });

  // Prepare data grouped by month
  const monthlyData = Array(12).fill(0); // 12 months initialized to 0
  transactions.forEach((transaction) => {
    const month = new Date(transaction.createdAt).getMonth(); // 0-indexed
    monthlyData[month] += transaction._sum.amount || 0;
  });

  return monthlyData;
};

const getMonthlyReviewOfCurrentYear = async () => {
  const currentYear = new Date().getFullYear();

  const reviews = await prisma.review.groupBy({
    by: ["rating", "createdAt"],
    _count: {
      _all: true, // Count all reviews
    },
    _avg: {
      rating: true, // Calculate average rating
    },
    where: {
      createdAt: {
        gte: new Date(`${currentYear}-01-01`),
        lt: new Date(`${currentYear + 1}-01-01`),
      },
    },
  });

  // Transform the grouped data into a monthly summary
  const monthlySummary: Record<string, { count: number; avgRating: number }> =
    {};

  reviews.forEach((review) => {
    const month = new Date(review.createdAt).toLocaleString("default", {
      month: "long",
    });
    if (!monthlySummary[month]) {
      monthlySummary[month] = {
        count: 0,
        avgRating: 0,
      };
    }
    monthlySummary[month].count += review._count?._all || 0;
    monthlySummary[month].avgRating =
      (monthlySummary[month].avgRating +
        (review._avg?.rating || 0) / review._count?._all) /
      2; // Weighted average
  });

  return monthlySummary;
};

export const UserService = {
  getUserFromDB,
  updateUserFromDB,
  getAllUsersFromDB,
  userStatueChange,
  getAllShopFromDB,
  createBlacklistShopFromDB,
  totalTransactionsHistoryFromDB,
  getOverviewFromDB,
  getMonthlyTransactionOfCurrentYear,
  getMonthlyReviewOfCurrentYear,
};
