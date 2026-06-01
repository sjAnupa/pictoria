import { Response } from 'express'

export function successResponse<T>(
  res: Response,
  data: T,
  statusCode = 200,
  message = 'Success',
): Response {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  })
}

export function errorResponse(
  res: Response,
  message: string,
  statusCode = 500,
  errors: string[] = [],
  code?: string,
): Response {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
    ...(code ? { code } : {}),
  })
}
