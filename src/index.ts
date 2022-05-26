import config from './config'
import createApp from './app'

const { server, prisma, mailer, logger } = createApp(config)

const close: any = async () => {
  if (close.closed) {
    return
  }
  close.closed = true
  mailer.close()
  await prisma.$disconnect()
  logger.info('Closing server...')

  await Promise.resolve((resolve: any) => server.close(resolve))
  logger.info('Server closed')
  process.exit()
}

server.on('close', close)
server.on('error', (err: any) => {
  logger.log(err)
  logger.error(err)
  if (err.code === 'EADDRINUSE') {
    close()
  }
})
server.listen(
  { host: config.API_HOST, port: config.API_PORT },
  () => {
    logger.info(`Server ready at ${config.API_HTTP}://${config.API_HOST}:${config.API_PORT}`)
  }
)

process.on('SIGINT', close)
process.on('SIGTERM', close)
