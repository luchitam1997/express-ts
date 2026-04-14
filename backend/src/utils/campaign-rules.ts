import { CampaignStatus } from '../types'

export type CampaignStats = {
  openRate: number
  sendRate: number
  openedCount: number
  deliveredCount: number
  totalRecipients: number
}

export const DRAFT_STATUS: CampaignStatus = 'draft'
export const SCHEDULED_STATUS: CampaignStatus = 'scheduled'
export const SENT_STATUS: CampaignStatus = 'sent'

export const canEditOrDeleteCampaign = (status: CampaignStatus) => {
  return status === DRAFT_STATUS
}

export const canScheduleCampaign = (status: CampaignStatus) => {
  return status === DRAFT_STATUS
}

export const canSendCampaign = (status: CampaignStatus) => {
  return status !== SENT_STATUS
}

export const parseFutureTimestamp = (rawTimestamp: string) => {
  const parsed = new Date(Number(rawTimestamp))

  if (Number.isNaN(parsed.getTime())) {
    return null
  }

  if (parsed.getTime() <= Date.now()) {
    return null
  }

  return parsed
}

export const buildCampaignStats = (counts: {
  total: number
  sent: number
  failed: number
  opened: number
}): CampaignStats => {
  const { total, sent, failed, opened } = counts

  const openRate = sent === 0 ? 0 : opened / sent
  const sendRate = total === 0 ? 0 : sent / total

  return {
    openRate: parseFloat((openRate * 100).toFixed(2)),
    sendRate: parseFloat((sendRate * 100).toFixed(2)),
    openedCount: opened,
    deliveredCount: sent - failed,
    totalRecipients: total
  }
}
