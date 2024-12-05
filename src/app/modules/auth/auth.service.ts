import { User, UserStatus } from "@prisma/client";
import prisma from "../../utils/prisma";
import AppError from "../../error/AppError";
import httpStatus from "http-status";
import bcrypt from "bcrypt";
import { jwtHelpers } from "../../utils/jwtHelpers";
import config from "../../config";
import { Secret } from "jsonwebtoken";
import { sendEmail } from "../../utils/sendEmail";

const createAccountIntoDB = async (payload: User) => {
  const isUserExist = await prisma.user.findFirst({
    where: {
      email: payload.email,
    },
  });
  if (isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User already exists");
  }
  const hashedPassword = await bcrypt.hash(payload.password, 12);
  const result = await prisma.user.create({
    data: {
      ...payload,
      password: hashedPassword,
    },
  });

  console.log("result", result);
  const accessToken = jwtHelpers.generateToken(
    {
      id: result.id,
      email: result.email,
      role: result.role,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  );
  const refreshToken = jwtHelpers.generateToken(
    {
      id: result.id,
      email: result.email,
      role: result.role,
    },
    config.jwt.refresh_token_secret as Secret,
    config.jwt.refresh_token_expires_in as string
  );
  return {
    accessToken,
    refreshToken,
  };
};

const loginUser = async (payload: { email: string; password: string }) => {
  const userData = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });
  if (!userData) {
    throw new AppError(httpStatus.BAD_REQUEST, "User not found");
  }
  if (userData.status === UserStatus.BLOCKED) {
    throw new AppError(httpStatus.BAD_REQUEST, "User is blocked");
  }
  const isPasswordMatched = await bcrypt.compare(
    payload.password,
    userData.password
  );
  if (!isPasswordMatched) {
    throw new AppError(httpStatus.BAD_REQUEST, "Password is incorrect");
  }
  const accessToken = jwtHelpers.generateToken(
    {
      id: userData.id,
      email: userData.email,
      role: userData.role,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  );
  const refreshToken = jwtHelpers.generateToken(
    {
      id: userData.id,
      email: userData.email,
      role: userData.role,
    },
    config.jwt.refresh_token_secret as Secret,
    config.jwt.refresh_token_expires_in as string
  );
  return {
    accessToken,
    refreshToken,
    needPasswordChange: userData.needPasswordChange,
  };
};

const refreshToken = async (token: string) => {
  let decodedData;
  try {
    decodedData = jwtHelpers.verifyToken(
      token,
      config.jwt.refresh_token_secret as Secret
    );
  } catch (error) {
    throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized!");
  }
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: decodedData.email,
      status: UserStatus.ACTIVE,
    },
  });
  const accessToken = jwtHelpers.generateToken(
    {
      id: userData.id,
      email: userData.email,
      role: userData.role,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  );
  return {
    accessToken,
    needPasswordChange: userData.needPasswordChange,
  };
};

const changepassword = async (user: any, payload: any) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
      status: UserStatus.ACTIVE,
    },
  });
  const isCorrectPassword: boolean = await bcrypt.compare(
    payload.oldPassword,
    userData.password
  );
  if (!isCorrectPassword) {
    throw new Error("password is incorrect");
  }
  const hashedPassword: string = await bcrypt.hash(payload.newPassword, 12);
  await prisma.user.update({
    where: {
      email: userData.email,
    },
    data: {
      password: hashedPassword,
      needPasswordChange: false,
    },
  });
  return {
    message: "password changed successfully!",
  };
};

const forgetPassword = async (payload: { email: string }) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });

  const resetPassToken = jwtHelpers.generateToken(
    { email: userData.email, role: userData.role },
    config.jwt.reset_pass_secret as Secret,
    config.jwt.reset_pass_token_expires_in as string
  );

  const resetPassUrl =
    config.reset_pass_link + `?email=${userData.email}&token=${resetPassToken}`;
  await sendEmail(userData.email, resetPassUrl);
};
const resetPassword = async (payload: {
  email: string;
  password: string;
  token: string;
}) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });
  const isValidToken = jwtHelpers.verifyToken(
    payload.token,
    config.jwt.reset_pass_secret as Secret
  );
  if (!isValidToken) {
    throw new AppError(httpStatus.FORBIDDEN, "Forbidden!");
  }
  const password = await bcrypt.hash(payload.password, 12);
  await prisma.user.update({
    where: {
      email: payload.email,
    },
    data: {
      password,
    },
  });
};

export const AuthServices = {
  createAccountIntoDB,
  loginUser,
  refreshToken,
  changepassword,
  forgetPassword,
  resetPassword,
};
