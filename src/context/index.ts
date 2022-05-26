import createLogger from './logger'
import createMailer from './mailer'

export default (config: any) => {
  const logger = createLogger(config)
  const mailer = createMailer(config, logger)

  return { logger, mailer }
}
