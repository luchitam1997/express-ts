export type CampaignStatus = 'draft' | 'scheduled' | 'sent'

export type CampaignStats = {
  openRate: number
  sendRate: number
  openedCount: number
  deliveredCount: number
  totalRecipients: number
}

export type Campaign = {
  id: string
  name: string
  subject: string
  body: string
  recipientEmails: string[]
  status: CampaignStatus
  scheduledAt: string | null
  createdAt: string
  updatedAt: string
  stats: CampaignStats
}

export type PaginatedCampaigns = {
  items: Campaign[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export type LoginPayload = {
  email: string
}

export type User = {
  id: string
  email: string
  name: string
}
export type LoginResponse = {
  data: {
    token: string
    user: User
  }
}

export type CreateCampaignPayload = {
  name: string
  subject: string
  body: string
  recipientEmails: string[]
}

export type NotificationSeverity = 'success' | 'error' | 'info'
