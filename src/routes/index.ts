import { Response } from 'express'
import User from '../controllers/user'

export default (app: any) => {
  // Users
  app.get('/users', User.list)

  app.use((_req: any, res: Response) => res
    .status(404).send({ error: 'Resource not found' }))
}
