// Rate limiting constants and in-memory store
export const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
export const RATE_LIMIT_MAX = 5 // max requests per IP per window
export const rateLimitStore: Record<string, { count: number; firstRequest: number }> = {}