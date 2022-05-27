
import {
  createTransport,
  SendMailOptions
} from 'nodemailer'
import
  hbs,
  { TemplateOptions }
from 'nodemailer-express-handlebars'
import { resolve } from 'path'
import { Logger } from 'winston'

export type SendMailOptionsExtented = SendMailOptions & TemplateOptions

export default (config: any, logger: Logger) => {
  const mailer = createTransport({
    host: config.EMAIL_HOST,
    port: config.EMAIL_PORT,
    auth: config.EMAIL_AUTH_USERNAME && config.EMAIL_AUTH_PASSWORD
      ? { user: config.EMAIL_AUTH_USERNAME, pass: config.EMAIL_AUTH_PASSWORD }
      : undefined
  })
  const templates = resolve(__dirname, '..', 'templates/')
  mailer.use(
    'compile',
    hbs({
      viewEngine: {
        partialsDir: templates,
        defaultLayout: false
      },
      viewPath: templates
    })
  )
  mailer.on('error', err => {
    logger.error(err.message)
  })
  mailer.on('idle', () => {
    logger.info('Mailer idle')
  })
  return mailer
}
