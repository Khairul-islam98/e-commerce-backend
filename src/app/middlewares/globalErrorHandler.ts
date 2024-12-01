import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";

const globalErrorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: error.message || "Something went wrong!",
    error,
  });
};

export default globalErrorHandler;
