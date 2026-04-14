import jwt from 'jsonwebtoken'
import { jwtConfig } from '../configs/jwt'
import { UserRecord } from '../types'

export const generateToken = (user: UserRecord) => {
  return jwt.sign(
    {
      sub: user.id,
      name: user.name,
      email: user.email
    },
    jwtConfig.secret as string,
    {
      expiresIn: jwtConfig.expiresIn
    }
  )
}
