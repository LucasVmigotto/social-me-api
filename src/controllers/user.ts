import { Response } from 'express'
import Request from '../types/request'
export default class User {
  static async list ({ prisma, logger }: Request, response: Response) {
    try {
      const users = await prisma.user.findMany()
      return response
        .status(200)
        .send({
          message: 'Users successfully listed',
          users
        })
    } catch (err) {
      console.log(err)
      logger.error(err)
      return response
        .status(500)
        .send({ error: 'An internal server occurred' })
    }
  }
}
