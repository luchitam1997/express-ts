import dotenv from 'dotenv'
import path from 'node:path'

// Load env from backend/.env by default, with a fallback to project root .env.
const envPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../.env')
]

for (const envPath of envPaths) {
  const result = dotenv.config({ path: envPath })
  if (!result.error) {
    break
  }
}
