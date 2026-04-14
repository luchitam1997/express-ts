import { Router } from 'express'
import {
  createCampaign,
  getCampaignById,
  getCampaigns,
  updateCampaign,
  deleteCampaign,
  sendCampaign,
  scheduleCampaign,
  getCampaignStats
} from '../controllers/campaign.controller'
import { authenticateToken } from '../middlewares/auth.middleware'

const campaignRouter = Router()

campaignRouter.post('/:id/schedule', authenticateToken, scheduleCampaign)
campaignRouter.post('/:id/send', authenticateToken, sendCampaign)
campaignRouter.get('/:id/stats', authenticateToken, getCampaignStats)

campaignRouter.post('/', authenticateToken, createCampaign)
campaignRouter.patch('/:id', authenticateToken, updateCampaign)
campaignRouter.delete('/:id', authenticateToken, deleteCampaign)
campaignRouter.get('/:id', authenticateToken, getCampaignById)
campaignRouter.get('', authenticateToken, getCampaigns)

export default campaignRouter
