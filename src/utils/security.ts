import {
  createCipheriv,
  scryptSync
} from 'crypto'
import { NextFunction, Response } from 'express'
import {
  verify,
  JsonWebTokenError
} from 'jsonwebtoken'
import config from '../config'
import Request from '../types/request'

export const cipherPassword = (password: string) => {
  const cipher = createCipheriv(
    config.CIPHER_ALGORITHM,
    scryptSync(password, config.CIPHER_SALT, 24),
    Buffer.alloc(16, 0))
  return cipher.update(password, 'utf8', 'hex') + cipher.final('hex')
}

const parseAuthHeader = (header: string) => {
  const [type, token] = header.split(' ')
  if (type !== 'Bearer') {
    throw new Error('Unsupported authorization method')
  } else {
    return token
  }
}

export const verifyJWT = (token: string, secret = config.JWT_SECRET) =>
  new Promise((resolve, reject) => {
    verify(token, secret, (err, tokenPayload) => {
      if (err) {
        reject(err)
      }
      resolve(tokenPayload)
    })
  })

export const authMiddleware = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { headers: { authorization } } = request
    if (!authorization) {
      return response
        .status(401)
        .send({ error: 'Token not submitted' })
    }
    const payload: any = await verifyJWT(parseAuthHeader(authorization))
    request.userId = payload.id
    next()
  } catch (err) {
    console.error(err)
    request.logger.error(err)
    return response
      .status(401)
      .send({ error: 'Access denied' })
  }
}
