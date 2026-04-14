import './configs/env'
import express from 'express'
import type { Application, Request, Response } from 'express'
import { initConfigs } from './configs'
import routes from './routes'
import cors from 'cors'

const port = 3000
const app: Application = express()

app.use(express.json({ strict: false }))
app.use(express.urlencoded({ extended: false }))

// CORS issues
app.use(cors())

initConfigs()

app.get('/healthcheck', (_: Request, res: Response) => {
  res.status(200).json({ status: 'ok' })
})

app.use(routes)

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
