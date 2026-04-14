import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { jwtConfig } from '../configs/jwt'
import { AuthUser } from '../types'

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authorizationHeader = req.headers.authorization

  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ message: 'Missing or invalid authorization header' })
  }

  const token = authorizationHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Authentication token is required' })
  }

  try {
    const decoded = jwt.verify(token, jwtConfig.secret)

    if (typeof decoded === 'string') {
      return res.status(401).json({ message: 'Invalid authentication token' })
    }

    const payload = decoded as {
      sub?: number | string
      email?: string
      name?: string
    }

    res.locals['authUser'] = {
      id: Number(payload.sub),
      email: String(payload.email ?? ''),
      name: String(payload.name ?? '')
    } as AuthUser

    return next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}
