import { Request, Response, NextFunction } from 'express'
import { errorResponse } from '../utils/apiResponse'
import { NODE_ENV } from '../config/env'

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
  const safeMessage =
    statusCode >= 500 && NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error'
  // Never leak stack internals for 5xx even in development beyond err.message.
  const clientMessage = statusCode >= 500 ? (NODE_ENV === 'production' ? 'Internal server error' : safeMessage) : (err.message || 'Request failed')
  errorResponse(res, clientMessage, statusCode)
}
