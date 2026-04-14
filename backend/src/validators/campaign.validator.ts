import { z } from 'zod'

export const createCampaignSchema = z.object({
  name: z.string().trim().min(1).max(255),
  subject: z.string().trim().min(1).max(255),
  body: z.string().trim().min(1),
  recipientEmails: z.array(z.string().trim().email()).optional()
})

export const updateCampaignSchema = z
  .object({
    name: z.string().trim().min(1).max(255).optional(),
    subject: z.string().trim().min(1).max(255).optional(),
    body: z.string().trim().min(1).optional()
  })
  .refine((value) => value.name || value.subject || value.body, {
    message: 'At least one field is required'
  })

export const scheduleCampaignSchema = z.object({
  scheduledAt: z.string().trim().min(1)
})

export const campaignIdSchema = z.object({
  id: z.coerce.number().int().positive()
})

export const listCampaignQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(10),
  offset: z.coerce.number().int().min(0).default(0),
  search: z.string().trim().default('')
})
