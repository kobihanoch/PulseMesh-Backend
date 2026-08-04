import { ErrorRequestHandler, Response } from "express";

export const errorHandler: ErrorRequestHandler = (
  err,
  req,
  res,
  next,
): Response<{ success: boolean; message: string }> => {
  // Log to dev console error stack
  // Log to prod console error message
  const statusCode = err.statusCode || 500;

  // Log
  console.error(
    {
      err,
      event: "request.failed",
      statusCode,
      method: req.method,
      path: req.originalUrl,
      userId: req.user?.id,
    },
    err.message || "Unhandled request error",
  );

  return res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};
