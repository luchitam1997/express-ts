const JWT_SECRET = process.env['JWT_SECRET'] || ''

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables')
}

export const jwtConfig = {
  secret: JWT_SECRET,
  expiresIn: 7 * 24 * 60 * 60 // 7 days in seconds
}
