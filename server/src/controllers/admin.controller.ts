import { Request, Response } from 'express'
import { successResponse } from '../utils/apiResponse'
import { getAdminDashboardStats } from '../services/admin.service'

export const getDashboardStats = async (_req: Request, res: Response): Promise<Response> => {
  const stats = await getAdminDashboardStats()
  return successResponse(res, stats)
}
