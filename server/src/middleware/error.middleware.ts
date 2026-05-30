import { Request, Response, NextFunction } from 'express'
import { errorResponse } from '../utils/apiResponse'

interface AppError extends Error {
  statusCode?: number
}

export const errorMiddleware = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  console.error(err)
  const statusCode = err.statusCode ?? 500
  errorResponse(res, err.message || 'Internal server error', statusCode)
}
