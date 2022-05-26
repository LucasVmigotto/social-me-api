import { Response } from 'express'
import User from '../controllers/user'

export default (app: any) => {
  // Auth
  app.patch('/auth/active-account', User.active)

  // Users
  app.post('/users/create', User.create)

  app.use((req: any, res: Response) => res
    .status(404).send({
      error: 'Resource not found',
      message: `${req.method}:${req.path} not allowed`
    }))
}
