import postgres from 'postgres'

const POSTGRES_URI = process.env['POSTGRES_URI']

if (!POSTGRES_URI) {
  throw new Error(
    'POSTGRES_URI is not defined. Check your .env file and load order.'
  )
}

const sql = postgres(POSTGRES_URI)

export default sql
