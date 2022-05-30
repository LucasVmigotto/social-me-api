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
}
