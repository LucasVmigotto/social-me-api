import { Response } from 'express'
import Request from '../interfaces/request'

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
          _count: {
            select: {
              likes: true,
              dislikes: true
            }
          },
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
  static async list ({ prisma, logger }: Request, response: Response) {
    try {
      const posts = await prisma.post.findMany({
        include: {
          _count: {
            select: {
              likes: true,
              dislikes: true
            }
          },
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
        }
      })
      return response
        .status(200)
        .send({
          message: 'Posts successfully listed',
          posts
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
      const old = await prisma.post.findUnique({
        where: { id: parseInt(params.postId) }
      })
      if (!old) {
        return response
          .status(409)
          .send({ error: 'Post not found' })
      }
      if (old.authorId !== userId) {
        return response
          .status(409)
          .send({ error: 'You can only edit your posts' })
      }
      await prisma.post.update({
        data: {
          title: body.title,
          content: body.content,
          published: body.published,
          history: {
            create: {
              newTitle: body.title,
              oldTitle: old.title,
              newContent: body.content,
              oldContent: old.content
            }
          }
        },
        where: { id: parseInt(params.postId) }
      })
      return response
        .status(200)
        .send({ message: 'Post successfully updated' })
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
      const post = await prisma.post.findUnique({
        select: { authorId: true },
        where: { id: parseInt(params.postId) }
      })
      if (!post) {
        return response
          .status(409)
          .send({ error: 'Post not found' })
      }
      const user = await prisma.user.findUnique({
        select: { isAdmin: true },
        where: { id: userId }
      })
      if (post.authorId !== userId && !user?.isAdmin) {
        return response
          .status(409)
          .send({ error: 'You can remove only your posts' })
      }
      await prisma.post.delete({
        where: { id: parseInt(params.postId) }
      })
      return response
        .status(200)
        .send({ message: 'Post successfully removed' })
    } catch (err) {
      console.error(err)
      logger.error(err)
      return response
        .status(500)
        .send({ error: 'An internal server occurred' })
    }
  }
  static async rate ({ userId, params, prisma, logger }: Request, response: Response) {
    try {
      if (!['like', 'dislike'].includes(params.rate)) {
        return response
          .status(409)
          .send({ error: 'Rate type not avaliable' })
      }
      if (params.rate === 'like') {
        prisma.dislike.delete({
          where: {
            postId_userId: {
              postId: parseInt(params.postId),
              userId: userId as number
            }
          }
        })
          .catch(() => null)
        const rated = await prisma.like.findUnique({
          where: {
            postId_userId: {
              postId: parseInt(params.postId),
              userId: userId as number,
            }
          }
        })
        if (rated) {
          return response
            .status(409)
            .send({ error: 'You already reacted to this post' })
        }
        await prisma.like.create({
          data: {
            post: { connect: { id: parseInt(params.postId) } },
            user: { connect: { id: userId } }
          }
        })
      } else {
        prisma.like.delete({
          where: {
            postId_userId: {
              postId: parseInt(params.postId),
              userId: userId as number
            }
          }
        })
          .catch(() => null)
        const rated = await prisma.dislike.findUnique({
          where: {
            postId_userId: {
              postId: parseInt(params.postId),
              userId: userId as number,
            }
          }
        })
        if (rated) {
          return response
            .status(409)
            .send({ error: 'You already reacted to this post' })
        }
        await prisma.dislike.create({
          data: {
            post: { connect: { id: parseInt(params.postId) } },
            user: { connect: { id: userId } }
          }
        })
      }
      return response
        .status(200)
        .send({ message: 'Post successfully rated' })
    } catch (err) {
      console.error(err)
      logger.error(err)
      return response
        .status(500)
        .send({ error: 'An internal server occurred' })
    }
  }
}
