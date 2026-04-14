import { Router } from 'express'
import authRouter from './auth.route'
import campaignRouter from './campaign.route'

const router = Router()

router.use('/auth', authRouter)
router.use('/campaigns', campaignRouter)

export default router
