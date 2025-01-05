import { Request, Response } from "express";
import httpStatus from "http-status";
export const notFound = (req: Request, res: Response) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    status: httpStatus.NOT_FOUND,
    message: "API Not Found!",
    error: {
      path: req.originalUrl,
      method: req.method,
    },
  });
};
