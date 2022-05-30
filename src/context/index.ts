import { Config } from '../config'
import createLogger from './logger'
import createMailer from './mailer'

export default (config: Config) => {
  const logger = createLogger(config)
  const mailer = createMailer(config, logger)

  return { logger, mailer }
}
