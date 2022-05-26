import { type Request as RequestExpress } from 'express'
import { Logger } from 'winston'
import { Transporter } from 'nodemailer'
import { PrismaClient } from '@prisma/client'

export default interface Request extends RequestExpress {
  logger: Logger,
  mailer: Transporter,
  prisma: PrismaClient
}
