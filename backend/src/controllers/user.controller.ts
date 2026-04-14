import { Request, Response } from 'express'
import sql from '../configs/postgres'
import { generateToken } from '../libs/jwt'
import { UserRecord } from '../types'
import { loginSchema, registerSchema } from '../validators/auth.validator'

export const registerUser = async (req: Request, res: Response) => {
  try {
    const parsedBody = registerSchema.safeParse(req.body)
    if (!parsedBody.success) {
      return res.status(400).json({
        message: 'Invalid request body',
        errors: parsedBody.error.flatten()
      })
    }

    const normalizedEmail = parsedBody.data.email.trim().toLowerCase()
    const normalizedName = parsedBody.data.name.trim()

    const existingUser = await sql<
      { id: number }[]
    >`SELECT id FROM users WHERE email = ${normalizedEmail}`

    if (existingUser[0]) {
      return res.status(409).json({ message: 'Email is already registered' })
    }

    const result = await sql<
      UserRecord[]
    >`INSERT INTO users (name, email) VALUES (${normalizedName}, ${normalizedEmail}) RETURNING id, name, email`
    const newUser = result[0]

    if (!newUser) {
      return res.status(500).json({ message: 'Failed to create user' })
    }

    const token = generateToken(newUser)

    return res.status(201).json({
      status: 'success',
      data: {
        user: newUser,
        token
      }
    })
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const loginUser = async (req: Request, res: Response) => {
  try {
    const parsedBody = loginSchema.safeParse(req.body)
    if (!parsedBody.success) {
      return res.status(400).json({
        message: 'Invalid request body',
        errors: parsedBody.error.flatten()
      })
    }

    const normalizedEmail = parsedBody.data.email.trim().toLowerCase()

    let user
    const result = await sql<
      UserRecord[]
    >`SELECT id, name, email FROM users WHERE email = ${normalizedEmail}`
    user = result[0]

    if (!user) {
      // Create a new one
      const insertResult = await sql<
        UserRecord[]
      >`INSERT INTO users (name, email) VALUES (${normalizedEmail}, ${normalizedEmail}) RETURNING id, name, email`
      user = insertResult[0]

      if (!user) {
        return res.status(500).json({ message: 'Failed to create user' })
      }
    }

    const token = generateToken(user)

    return res.status(200).json({
      status: 'success',
      data: {
        user,
        token
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const getMe = async (_req: Request, res: Response) => {
  return res.status(200).json({
    status: 'success',
    data: {
      user: res.locals['authUser']
    }
  })
}
