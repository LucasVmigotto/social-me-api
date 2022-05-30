import { Prisma } from '@prisma/client'
import { Response } from 'express'
import Request from '../interfaces/request'
import config from '../config'
import { SendMailOptionsExtented } from '../context/mailer'

export default class User {
  static async create ({ userId, body, prisma, logger }: Request, response: Response) {
    try {
      const created = await prisma.post.create({
        data: {
          ...body,
          author: { connect: { id: userId } }
        }
      })
      return response
        .status(200)
        .send({
          message: 'Post successfully created',
          post: created
        })
    } catch (err) {
      console.error(err)
      logger.error(err)
      return response
        .status(500)
        .send({ error: 'An internal server occurred' })
    }
  }
  static async viewPost ({ userId, params, prisma, logger }: Request, response: Response) {
    try {
      const exists = await prisma.post.findUnique({
        select: {
          authorId: true,
          published: true
        },
        where: { id: parseInt(params.postId) }
      })
      if (exists && exists.authorId !== userId && exists.published) {
        const poo = await prisma.post.update({
          data: { views: { increment: 1 } },
          where: { id: parseInt(params.postId) }
        })
      }
      const post = await prisma.post.findUnique({
        include: {
          commentaries: {
            select: {
              id: true,
              content: true,
              author: {
                select: { name: true }
              }
            },
            where: { deletedBy: null }
          }
        },
        where: { id: parseInt(params.postId) }
      })
      return response
        .status(200)
        .send({
          message: 'Post found',
          post
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
