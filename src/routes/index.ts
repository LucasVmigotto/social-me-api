import { Response } from 'express'
import User from '../controllers/user'
import { authMiddleware } from '../utils'

export default (app: any) => {
  // Auth
  app.patch('/auth/active-account', User.active)
  app.post('/auth/forgot-password', User.forgotPassword)
  app.post('/auth/reset-password', User.resetPassword)
  app.post('/auth/login', User.login)

  // Users
  app.post('/users/create', User.create)
  app.get('/users/me', authMiddleware, User.whoami)

  app.use((req: any, res: Response) => res
    .status(404).send({
      error: 'Resource not found',
      message: `${req.method}:${req.path} not allowed`
    }))
}
