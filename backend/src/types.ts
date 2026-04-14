export type UserRecord = {
  id: number
  name: string
  email: string
}

export interface CreateCampaignRequest {
  name: string
  subject: string
  body: string
}

export type CampaignStatus = 'draft' | 'scheduled' | 'sent'

export type CampaignRecipientStatus = 'pending' | 'sent' | 'failed'

export type AuthUser = {
  id: number
  email: string
  name: string
}
