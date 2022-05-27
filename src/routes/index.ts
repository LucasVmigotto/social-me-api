import { Response } from 'express'
import User from '../controllers/user'
import {
  adminOnly,
  authMiddleware
} from '../utils'

export default (app: any) => {
  // Auth
  app.patch('/auth/active-account', User.active)
  app.post('/auth/forgot-password', User.forgotPassword)
  app.post('/auth/reset-password', User.resetPassword)
  app.post('/auth/login', User.login)

  // Users
  app.post('/users', User.create)
  app.get('/users/whoami', authMiddleware, User.whoami)
  app.get('/users', authMiddleware, adminOnly, User.list)
  app.get('/users/:userId', authMiddleware, User.getUser)
  app.put('/users/:userId', authMiddleware, User.update)
  app.put('/users/profile/:userId', authMiddleware, User.updateProfile)
  app.patch('/users/account-state/:state/:userId', authMiddleware, adminOnly, User.activeAccountState)
  app.delete('/users/:userId', authMiddleware, adminOnly, User.remove)

  app.use((req: any, res: Response) => res
    .status(404).send({
      error: 'Resource not found',
      message: `${req.method}:${req.path} not allowed`
    }))
}
