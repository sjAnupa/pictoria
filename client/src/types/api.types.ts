export type ApiSuccess<T> = {
  success: boolean
  message?: string
  data: T
}

export type ApiErrorBody = {
  success: false
  message: string
  errors?: string[]
}
