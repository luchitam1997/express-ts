import { Request, Response } from 'express'
import { AuthUser, CampaignStatus } from '../types'
import sql from '../configs/postgres'
import {
  campaignIdSchema,
  createCampaignSchema,
  listCampaignQuerySchema,
  scheduleCampaignSchema,
  updateCampaignSchema
} from '../validators/campaign.validator'
import {
  buildCampaignStats,
  canEditOrDeleteCampaign,
  canScheduleCampaign,
  canSendCampaign,
  DRAFT_STATUS,
  parseFutureTimestamp,
  SCHEDULED_STATUS,
  SENT_STATUS
} from '../utils/campaign-rules'

const getAuthUser = (res: Response): AuthUser | null => {
  const user = res.locals['authUser'] as AuthUser | undefined
  return user ?? null
}

const getCampaignForUser = async (campaignId: number, userId: number) => {
  const campaigns = await sql<
    {
      id: number
      name: string
      subject: string
      body: string
      status: CampaignStatus
      scheduled_at: string | null
      created_at: string
      updated_at: string
      created_by: number
      recipient_emails: string[]
    }[]
  >`
    SELECT
      c.id,
      c.name,
      c.subject,
      c.body,
      c.status,
      c.scheduled_at,
      c.created_at,
      c.updated_at,
      c.created_by,
      COALESCE(
        ARRAY_AGG(r.email) FILTER (WHERE r.email IS NOT NULL),
        ARRAY[]::text[]
      ) AS recipient_emails
    FROM campaigns c
    LEFT JOIN campaign_recipients cr ON c.id = cr.campaign_id
    LEFT JOIN recipients r ON cr.recipient_id = r.id
    WHERE c.id = ${campaignId} AND c.created_by = ${userId}
    GROUP BY c.id, c.name, c.subject, c.body, c.status, c.scheduled_at, c.created_at, c.updated_at, c.created_by
  `

  return campaigns[0] ?? null
}

const getStatsForCampaign = async (campaignId: number) => {
  const counts = await sql<
    {
      total: number
      sent: number
      failed: number
      opened: number
    }[]
  >`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE status = 'sent')::int AS sent,
      COUNT(*) FILTER (WHERE status = 'failed')::int AS failed,
      COUNT(*) FILTER (WHERE opened_at IS NOT NULL)::int AS opened
    FROM campaign_recipients
    WHERE campaign_id = ${campaignId}
  `

  const stats = counts[0] ?? { total: 0, sent: 0, failed: 0, opened: 0 }
  return buildCampaignStats(stats)
}

export const createCampaign = async (req: Request, res: Response) => {
  try {
    const authUser = getAuthUser(res)
    if (!authUser) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const parsedBody = createCampaignSchema.safeParse(req.body)
    if (!parsedBody.success) {
      return res.status(400).json({
        message: 'Invalid request body',
        errors: parsedBody.error.flatten()
      })
    }

    const result = await sql<
      {
        id: number
        name: string
        subject: string
        body: string
        status: CampaignStatus
        scheduled_at: string | null
      }[]
    >`
      INSERT INTO campaigns (name, subject, body, status, created_by)
      VALUES (
        ${parsedBody.data.name},
        ${parsedBody.data.subject},
        ${parsedBody.data.body},
        ${DRAFT_STATUS},
        ${authUser.id}
      )
      RETURNING id, name, subject, body, status, scheduled_at
    `
    const newCampaign = result[0]

    if (!newCampaign) {
      return res.status(500).json({ message: 'Failed to create campaign' })
    }

    if (
      parsedBody.data.recipientEmails &&
      parsedBody.data.recipientEmails.length > 0
    ) {
      // Insert recipient emails and campaign_recipients in one go using insertMany patterns
      const insertedRecipients = await sql<
        {
          id: number
          email: string
        }[]
      >`
        INSERT INTO recipients (email, name)
        VALUES ${sql(parsedBody.data.recipientEmails.map((email) => [email, email]))}
        ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
        RETURNING id, email
      `

      const campaignRecipientValues = insertedRecipients.map((recipient) => [
        newCampaign.id,
        recipient.id,
        'pending'
      ])

      await sql`
        INSERT INTO campaign_recipients (campaign_id, recipient_id, status)
        VALUES ${sql(campaignRecipientValues)}
      `
    }

    return res.status(201).json({
      status: 'success',
      data: newCampaign
    })
  } catch (error) {
    console.log('Error creating campaign:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const getCampaigns = async (req: Request, res: Response) => {
  try {
    const authUser = getAuthUser(res)
    if (!authUser) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const parsedQuery = listCampaignQuerySchema.safeParse(req.query)
    if (!parsedQuery.success) {
      return res.status(400).json({
        message: 'Invalid query params',
        errors: parsedQuery.error.flatten()
      })
    }

    const { limit, offset, search } = parsedQuery.data

    const campaigns = await sql<
      {
        id: number
        name: string
        subject: string
        body: string
        status: CampaignStatus
        scheduled_at: string | null
        created_at: string
        updated_at: string
        recipient_emails: string[]
      }[]
    >`
      SELECT c.id, c.name, c.subject, c.body, c.status, c.scheduled_at, c.created_at, c.updated_at, 
             COALESCE(
               ARRAY_AGG(r.email) FILTER (WHERE r.email IS NOT NULL),
               ARRAY[]::text[]
             ) AS recipient_emails
      FROM campaigns c
      LEFT JOIN campaign_recipients cr ON c.id = cr.campaign_id
      LEFT JOIN recipients r ON cr.recipient_id = r.id
      WHERE c.created_by = ${authUser.id}
        AND (c.name ILIKE ${`%${search}%`} OR c.subject ILIKE ${`%${search}%`})
      GROUP BY c.id, c.name, c.subject, c.body, c.status, c.scheduled_at, c.created_at, c.updated_at
      ORDER BY c.created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `

    const countResult = await sql<{ count: number }[]>`
      SELECT COUNT(*)::int AS count
      FROM campaigns
      WHERE created_by = ${authUser.id}
        AND (name ILIKE ${`%${search}%`} OR subject ILIKE ${`%${search}%`})
    `
    const total = countResult[0]?.count ?? 0

    const formattedCampaigns = await Promise.all(
      campaigns.map(async (campaign) => ({
        ...campaign,
        createdAt: campaign.created_at,
        updatedAt: campaign.updated_at,
        scheduledAt: campaign.scheduled_at,
        recipientEmails: campaign.recipient_emails,
        stats: await getStatsForCampaign(campaign.id)
      }))
    )

    return res.status(200).json({
      status: 'success',
      items: formattedCampaigns,
      page: Math.floor(offset / limit) + 1,
      pageSize: limit,
      total: total,
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.log('Error fetching campaigns:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

// Get campaign by ID
export const getCampaignById = async (req: Request, res: Response) => {
  try {
    const authUser = getAuthUser(res)
    if (!authUser) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const parsedParams = campaignIdSchema.safeParse(req.params)
    if (!parsedParams.success) {
      return res.status(400).json({
        message: 'Invalid campaign id',
        errors: parsedParams.error.flatten()
      })
    }

    const campaign = await getCampaignForUser(parsedParams.data.id, authUser.id)
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' })
    }

    const stats = await getStatsForCampaign(campaign.id)

    const campaignFormatted = {
      ...campaign,
      createdAt: campaign.created_at,
      updatedAt: campaign.updated_at,
      scheduledAt: campaign.scheduled_at,
      recipientEmails: campaign.recipient_emails
    }
    return res.status(200).json({
      status: 'success',
      data: {
        ...campaignFormatted,
        stats
      }
    })
  } catch (error) {
    console.log('Error fetching campaign:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

// Update campaign by ID
export const updateCampaign = async (req: Request, res: Response) => {
  try {
    const authUser = getAuthUser(res)
    if (!authUser) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const parsedParams = campaignIdSchema.safeParse(req.params)
    if (!parsedParams.success) {
      return res.status(400).json({
        message: 'Invalid campaign id',
        errors: parsedParams.error.flatten()
      })
    }

    const parsedBody = updateCampaignSchema.safeParse(req.body)
    if (!parsedBody.success) {
      return res.status(400).json({
        message: 'Invalid request body',
        errors: parsedBody.error.flatten()
      })
    }

    const currentCampaign = await getCampaignForUser(
      parsedParams.data.id,
      authUser.id
    )
    if (!currentCampaign) {
      return res.status(404).json({ message: 'Campaign not found' })
    }

    if (!canEditOrDeleteCampaign(currentCampaign.status)) {
      return res.status(400).json({
        message: 'A campaign can only be edited while status is draft'
      })
    }

    const { name, subject, body } = parsedBody.data

    const result = await sql<
      {
        id: number
        name: string
        subject: string
        body: string
        status: CampaignStatus
        scheduled_at: string | null
        updated_at: string
      }[]
    >`
      UPDATE campaigns
      SET
        name = COALESCE(${name ?? null}, name),
        subject = COALESCE(${subject ?? null}, subject),
        body = COALESCE(${body ?? null}, body),
        updated_at = NOW()
      WHERE id = ${parsedParams.data.id} AND created_by = ${authUser.id}
      RETURNING id, name, subject, body, status, scheduled_at, updated_at
    `
    const updatedCampaign = result[0]

    if (!updatedCampaign) {
      return res.status(404).json({ message: 'Campaign not found' })
    }

    return res.status(200).json({
      status: 'success',
      data: updatedCampaign
    })
  } catch (error) {
    console.log('Error updating campaign:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const deleteCampaign = async (req: Request, res: Response) => {
  try {
    const authUser = getAuthUser(res)
    if (!authUser) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const parsedParams = campaignIdSchema.safeParse(req.params)
    if (!parsedParams.success) {
      return res.status(400).json({
        message: 'Invalid campaign id',
        errors: parsedParams.error.flatten()
      })
    }

    const campaign = await getCampaignForUser(parsedParams.data.id, authUser.id)
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' })
    }

    if (!canEditOrDeleteCampaign(campaign.status)) {
      return res.status(400).json({
        message: 'A campaign can only be deleted while status is draft'
      })
    }

    await sql`DELETE FROM campaigns WHERE id = ${parsedParams.data.id} AND created_by = ${authUser.id}`

    return res.status(200).json({
      status: 'success',
      message: 'Campaign deleted successfully'
    })
  } catch (error) {
    console.log('Error deleting campaign:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const scheduleCampaign = async (req: Request, res: Response) => {
  try {
    const authUser = getAuthUser(res)
    if (!authUser) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const parsedParams = campaignIdSchema.safeParse(req.params)
    if (!parsedParams.success) {
      return res.status(400).json({
        message: 'Invalid campaign id',
        errors: parsedParams.error.flatten()
      })
    }

    const parsedBody = scheduleCampaignSchema.safeParse(req.body)
    if (!parsedBody.success) {
      return res.status(400).json({
        message: 'Invalid request body',
        errors: parsedBody.error.flatten()
      })
    }

    const scheduledAt = parseFutureTimestamp(parsedBody.data.scheduledAt)
    if (!scheduledAt) {
      return res.status(400).json({
        message: 'scheduledAt must be a valid future timestamp'
      })
    }

    const campaign = await getCampaignForUser(parsedParams.data.id, authUser.id)
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' })
    }

    if (!canScheduleCampaign(campaign.status)) {
      return res.status(400).json({
        message: 'Only draft campaigns can be scheduled'
      })
    }

    const result = await sql<
      {
        id: number
        name: string
        subject: string
        body: string
        status: CampaignStatus
        scheduled_at: string | null
        updated_at: string
      }[]
    >`
      UPDATE campaigns
      SET status = ${SCHEDULED_STATUS}, scheduled_at = ${scheduledAt.toISOString()}, updated_at = NOW()
      WHERE id = ${parsedParams.data.id} AND created_by = ${authUser.id}
      RETURNING id, name, subject, body, status, scheduled_at, updated_at
    `

    const scheduledCampaign = result[0]
    if (!scheduledCampaign) {
      return res.status(404).json({ message: 'Campaign not found' })
    }

    return res.status(200).json({
      status: 'success',
      data: scheduledCampaign
    })
  } catch (error) {
    console.log('Error scheduling campaign:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const sendCampaign = async (req: Request, res: Response) => {
  try {
    const authUser = getAuthUser(res)
    if (!authUser) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const parsedParams = campaignIdSchema.safeParse(req.params)
    if (!parsedParams.success) {
      return res.status(400).json({
        message: 'Invalid campaign id',
        errors: parsedParams.error.flatten()
      })
    }

    const campaign = await getCampaignForUser(parsedParams.data.id, authUser.id)
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' })
    }

    if (!canSendCampaign(campaign.status)) {
      return res.status(400).json({
        message: 'Sending cannot be undone once a campaign is sent'
      })
    }

    await sql.begin(async (tx) => {
      await tx`
        UPDATE campaign_recipients
        SET status = 'sent', sent_at = NOW()
        WHERE campaign_id = ${parsedParams.data.id} AND status = 'pending'
      `

      await tx`
        UPDATE campaigns
        SET status = ${SENT_STATUS}, updated_at = NOW()
        WHERE id = ${parsedParams.data.id} AND created_by = ${authUser.id}
      `
    })

    const updatedCampaign = await getCampaignForUser(
      parsedParams.data.id,
      authUser.id
    )
    if (!updatedCampaign) {
      return res.status(404).json({ message: 'Campaign not found' })
    }

    return res.status(200).json({
      status: 'success',
      data: updatedCampaign
    })
  } catch (error) {
    console.log('Error sending campaign:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const getCampaignStats = async (req: Request, res: Response) => {
  try {
    const authUser = getAuthUser(res)
    if (!authUser) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const parsedParams = campaignIdSchema.safeParse(req.params)
    if (!parsedParams.success) {
      return res.status(400).json({
        message: 'Invalid campaign id',
        errors: parsedParams.error.flatten()
      })
    }

    const campaign = await getCampaignForUser(parsedParams.data.id, authUser.id)
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' })
    }

    const stats = await getStatsForCampaign(campaign.id)

    return res.status(200).json({
      status: 'success',
      data: stats
    })
  } catch (error) {
    console.log('Error fetching campaign stats:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
