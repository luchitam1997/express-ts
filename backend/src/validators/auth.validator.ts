import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().trim().min(1).max(255),
  email: z.string().trim().email().max(255)
})

export const loginSchema = z.object({
  email: z.string().trim().email().max(255)
})
