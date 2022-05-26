import
  express,
  { NextFunction }
from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { createServer } from 'http'
import { PrismaClient } from '@prisma/client'
import createContext from './context'
import router from './routes'
import Request from './types/request'

export default (config: any) => {
  const { logger, mailer } = createContext(config)

  const app = express()

  const prisma = new PrismaClient()

  app.use(cors())
  app.use(express.urlencoded({ extended: true }))
  app.use(express.json())

  if (config.NODE_ENV === 'development') {
    app.use(morgan('combined'))
  }

  app.use((request: Request,  response: any, next: any) => {
    request.logger = logger
    request.mailer = mailer
    request.prisma = prisma
    next()
  })

  router(app)

  const server = createServer(app)

  return { server, prisma, mailer, logger }
}
