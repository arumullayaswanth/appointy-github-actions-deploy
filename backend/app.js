import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import adminRouter from './routes/adminRoute.js'
import doctorRouter from './routes/doctorRoute.js'
import userRouter from './routes/userRoute.js'

const app = express()

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(express.json())
app.use(cors({
  origin: allowedOrigins.length ? allowedOrigins : true,
  credentials: true,
}))

app.use('/api/admin', adminRouter)
app.use('/api/doctor', doctorRouter)
app.use('/api/user', userRouter)

app.get('/', (req, res) => {
  res.send('API Working')
})

app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok' })
})

app.get('/readyz', (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ status: 'error', database: 'disconnected' })
  }

  return res.status(200).json({ status: 'ok', database: 'connected' })
})

export default app
