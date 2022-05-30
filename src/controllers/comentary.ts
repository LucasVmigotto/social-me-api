import { Response } from 'express'
import Request from '../interfaces/request'
import config from '../config'
import { SendMailOptionsExtented } from '../context/mailer'
import { emailAddress } from '../utils'

export default class Commentary {
  static async create ({ userId, body, prisma, mailer, logger }: Request, response: Response) {
    try {
      const commentary = await prisma.commentary.create({
        data: {
          content: body.content,
          post: { connect: { id: body.postId } },
          author: { connect: { id: userId } }
        },
        include: {
          post: {
            select: {
              title: true,
              author: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          },
          author: { select: { name: true } }
        }
      })
      mailer.sendMail({
        from: emailAddress(config.EMAIL_NAME, config.EMAIL_ADDR),
        to: emailAddress(commentary.post.author.name, commentary.post.author.email),
        subject: 'Post: New commentary',
        template: 'newCommentary',
        context: {
          name: commentary.post.author.name,
          title: commentary.post.title,
          author: commentary.author.name,
          commentary: commentary.content
        }
      } as SendMailOptionsExtented)
      return response
        .status(200)
        .send({
          message: 'Post successfully created'
        })
    } catch (err) {
      console.error(err)
      logger.error(err)
      return response
        .status(500)
        .send({ error: 'An internal server occurred' })
    }
  }
  static async update ({ userId, params, body, prisma, logger }: Request, response: Response) {
    try {
      const commentary = await prisma.commentary.findUnique({
        select: { authorId: true },
        where: { id: parseInt(params.commentaryId) }
      })
      if (!commentary) {
        return response
          .status(409)
          .send({ error: 'Commentary not found' })
      }
      if (commentary.authorId !== userId) {
        return response
          .status(409)
          .send({ error: 'You can only edit your commentaries' })
      }
      await prisma.commentary.update({
        data: { content: body.content },
        where: { id: parseInt(params.commentaryId ) }
      })
      return response
        .status(200)
        .send({
          message: 'Commentary successfully updated'
        })
    } catch (err) {
      console.error(err)
      logger.error(err)
      return response
        .status(500)
        .send({ error: 'An internal server occurred' })
    }
  }
  static async remove ({ userId, params, prisma, logger }: Request, response: Response) {
    try {
      const commentary = await prisma.commentary.findUnique({
        select: {
          authorId: true,
          post: { select: { authorId: true } }
        },
        where: { id: parseInt(params.commentaryId) }
      })
      if (!commentary) {
        return response
          .status(409)
          .send({ error: 'Commentary not found' })
      }
      const user = await prisma.user.findUnique({
        select: { isAdmin: true },
        where: { id: userId }
      })
      if (commentary.authorId !== userId && commentary.post.authorId !== userId && !user?.isAdmin) {
        return response
          .status(409)
          .send({ error: 'You can only edit your commentaries' })
      }
      await prisma.commentary.update({
        data: {
          deletedBy: commentary.authorId === userId
            ? 'COMMENT_CREATOR'
            : commentary.post.authorId === userId
              ? 'POST_OWNER'
              : 'ADMIN'
        },
        where: { id: parseInt(params.commentaryId ) }
      })
      return response
        .status(200)
        .send({
          message: 'Commentary successfully removed'
        })
    } catch (err) {
      console.error(err)
      logger.error(err)
      return response
        .status(500)
        .send({ error: 'An internal server occurred' })
    }
  }
  static async list ({ params, prisma, logger }: Request, response: Response) {
    try {
      const commentaries = await prisma.commentary.findMany({
        select: {
          content: true,
          author: { select: { name: true } }
        },
        where: { deletedBy: null }
      })
      return response
        .status(200)
        .send({
          message: 'Commentaries successfully listed',
          commentaries
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
