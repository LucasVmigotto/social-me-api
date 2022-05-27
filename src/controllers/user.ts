import { Prisma } from '@prisma/client'
import { Response } from 'express'
import { sign } from 'jsonwebtoken'
import Request from '../types/request'
import config from '../config'
import passwordResetTemplate from '../templates/passwordReset.template'
import forgotPasswordTemplate from '../templates/forgotPassword.template'
import newAccountTemplate from '../templates/newAccount.template'
import accountActivatedTemplateCopy from '../templates/accountActivated.template'
import {
  cipherPassword,
  emailAddress,
  verifyJWT
} from '../utils'

export default class User {
  static async create ({ body, prisma, mailer, logger }: Request, response: Response) {
    try {
      const { user, profile } = body
      const created = await prisma.user.create({
        data: {
          ...user,
          password: cipherPassword(body.user.password),
          profile: { create: { ...profile } }
        }
      })
      const { token } = await prisma.singleUseToken.create({
        data: {
          userId: created.id,
          token: sign(
            { id: created.id },
            config.JWT_SECRET,
            { expiresIn: config.JWT_UNIQUE_USE_EXP }
          )
        }
      })
      await mailer.sendMail({
        from: emailAddress(config.EMAIL_NAME, config.EMAIL_ADDR),
        to: emailAddress(created.name, created.email),
        subject: 'Wellcome: Active your account',
        html: newAccountTemplate(
          created.name,
          `${config.API_URL}/auth/active-account?token=${token}`
        )
      })
      return response
        .status(200)
        .send({
          message: 'User successfully created'
        })
    } catch (err) {
      console.error(err)
      logger.error(err)
      return response
        .status(500)
        .send({ error: 'An internal server occurred' })
    }
  }
  static async active ({ query, prisma, mailer, logger }: Request, response: Response) {
    try {
      if (!query.token) {
        return response
          .status(409)
          .send({ error: 'Token not submitted' })
      }
      const payload: any = await verifyJWT(query.token as string)
      const tokenExists = await prisma.singleUseToken.findUnique({
        where: { token: query.token as string }
      })
      if (!tokenExists) {
        return response
          .status(401)
          .send({ error: 'Token is no more valid' })
      }
      const updated = await prisma.user.update({
        data: { activeAccount: true },
        where: { id: payload.id }
      })
      await prisma.singleUseToken.delete({
        where: { token: query.token as string }
      })
      await mailer.sendMail({
        from: emailAddress(config.EMAIL_NAME, config.EMAIL_ADDR),
        to: emailAddress(updated.name, updated.email),
        subject: 'Wellcome: Active your account',
        html: accountActivatedTemplateCopy(
          updated.name,
          `${config.API_CLIENT}/auth/login`
        )
      })
      return response
        .redirect(`${config.API_CLIENT}/auth/login`)
    } catch (err) {
      console.error(err)
      logger.error(err)
      return response
        .status(500)
        .send({ error: 'An internal server occurred' })
    }
  }
  static async forgotPassword ({ body, prisma, mailer, logger }: Request, response: Response) {
    try {
      if (!body.email) {
        return response
          .status(409)
          .send({ error: 'E-Mail not submitted' })
      }
      const user = await prisma.user.findUnique({
        where: { email: body.email }
      })
      if (!user) {
        return response
          .status(409)
          .send({ error: 'User not found' })
      }
      const { token } = await prisma.singleUseToken.create({
        data: {
          userId: user.id,
          token: sign(
            { id: user.id },
            config.JWT_SECRET,
            { expiresIn: config.JWT_UNIQUE_USE_EXP }
          )
        }
      })
      await mailer.sendMail({
        from: emailAddress(config.EMAIL_NAME, config.EMAIL_ADDR),
        to: emailAddress(user.name, user.email),
        subject: 'Account: Password re-defined',
        html: forgotPasswordTemplate(`${config.API_CLIENT}/auth/reset-password?token=${token}`)
      })
      return response
        .status(200)
        .send({ message: 'E-Mail successfully sent' })
    } catch (err) {
      console.error(err)
      logger.error(err)
      return response
        .status(500)
        .send({ error: 'An internal server occurred' })
    }
  }
  static async resetPassword ({ body, query, prisma, mailer, logger }: Request, response: Response) {
    try {
      if (!query.token) {
        return response
          .status(409)
          .send({ error: 'Token not submitted' })
      }
      const payload: any = await verifyJWT(query.token as string)
      const tokenExists = await prisma.singleUseToken.findUnique({
        where: { token: query.token as string }
      })
      if (!tokenExists) {
        return response
          .status(401)
          .send({ error: 'Token is no more valid' })
      }
      const updated = await prisma.user.update({
        data: { password: cipherPassword(body.password) },
        where: { id: payload.id }
      })
      await prisma.singleUseToken.delete({
        where: { token: query.token as string }
      })
      await mailer.sendMail({
        from: emailAddress(config.EMAIL_NAME, config.EMAIL_ADDR),
        to: emailAddress(updated.name, updated.email),
        subject: 'Account: Password re-defined',
        html: passwordResetTemplate(
          updated.name,
          `${config.API_CLIENT}/auth/login`
        )
      })
      return response
        .redirect(`${config.API_CLIENT}/auth/login`)
    } catch (err) {
      console.error(err)
      logger.error(err)
      return response
        .status(500)
        .send({ error: 'An internal server occurred' })
    }
  }
  static async login ({ body, prisma, logger }: Request, response: Response) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: body.email }
      })
      if (!user) {
        return response
          .status(409)
          .send({ error: 'User not found' })
      }
      if (user.password !== cipherPassword(body.password)) {
        return response
          .status(401)
          .send({ error: 'E-Mail or password invalid' })
      }
      const token = sign(
        { id: user.id },
        config.JWT_SECRET,
        { expiresIn: config.JWT_SESSION_EXP }
      )
      return response
        .status(200)
        .send({
          message: 'Login was successfully complete',
          token
        })
    } catch (err) {
      console.error(err)
      logger.error(err)
      return response
        .status(500)
        .send({ error: 'An internal server occurred' })
    }
  }
  static async whoami ({ userId, prisma, logger }: Request, response: Response) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          email: true,
          profile: { select: { bio: true } }
        }
      })
      return response
        .status(200)
        .send({
          message: 'User successfully retrieved',
          user
        })
    } catch (err) {
      console.error(err)
      logger.error(err)
      return response
        .status(500)
        .send({ error: 'An internal server occurred' })
    }
  }
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
      console.error(err)
      logger.error(err)
      return response
        .status(500)
        .send({ error: 'An internal server occurred' })
    }
  }
}
