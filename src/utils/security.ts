import {
  createCipheriv,
  scryptSync
} from 'crypto'
import { verify } from 'jsonwebtoken'
import config from '../config'

export const cipherPassword = (password: string) => {
  const cipher = createCipheriv(
    config.CIPHER_ALGORITHM,
    scryptSync(password, config.CIPHER_SALT, 24),
    Buffer.alloc(16, 0))
  return cipher.update(password, 'utf8', 'hex') + cipher.final('hex')
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
