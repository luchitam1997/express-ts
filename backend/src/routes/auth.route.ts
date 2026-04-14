import { Router } from 'express'
import { getMe, loginUser, registerUser } from '../controllers/user.controller'
import { authenticateToken } from '../middlewares/auth.middleware'

const authRouter = Router()

authRouter.post('/register', registerUser)
authRouter.post('/login', loginUser)
authRouter.get('/me', authenticateToken, getMe)

export default authRouter
