import { User } from "@prisma/client";
import prisma from "../../utils/prisma";

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

export const UserService = {
  getUserFromDB,
  updateUserFromDB,
};
