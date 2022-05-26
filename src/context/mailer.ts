
import { Logger } from 'winston'
import { createTransport } from 'nodemailer'

export default (config: any, logger: Logger) => {

  const mailer = createTransport({
    host: config.EMAIL_HOST,
    port: config.EMAIL_PORT,
    auth: config.EMAIL_AUTH
  })

  mailer.on('error', err => {
    logger.error(err.message)
  })

  mailer.on('idle', () => {
    logger.info('Mailer idle')
  })

  return mailer
}
