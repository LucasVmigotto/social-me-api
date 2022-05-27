import {
  Logger,
  createLogger,
  format,
  transports
} from 'winston'
import { Config } from '../config'

export default (config: Config): Logger => {
  const formatLogger = config.NODE_ENV === 'production'
    ? format.combine(format.timestamp(), format.json())
    : format.combine(format.timestamp(), format.prettyPrint(), format.colorize())
  return createLogger({
    silent: config.NODE_ENV === 'test',
    level: config.LOG_LEVEL,
    format: formatLogger,
    transports: [new transports.Console()]
  })
}
