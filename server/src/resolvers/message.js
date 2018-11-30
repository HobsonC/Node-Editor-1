import uuidv4 from 'uuid/v4'
import { ForbiddenError } from 'apollo-server'
import { combineResolvers } from 'graphql-resolvers'
import { isAuthenticated, isMessageOwner } from './authorization'
import pubsub, { EVENTS } from '../subscriptions'

export default {
    Query: {
        messages: async (parent,args,{models}) => {
            return await models.Message.findAll()
        },
        message: async (parent,{id},{models}) => {
            return await models.Message.findById(id)
        }
    },

    Mutation: {
        createMessage: combineResolvers(
            isAuthenticated,
            async (parent,{text},{models,me}) => {
                const message = await models.Message.create({text,userId:me.id})

                pubsub.publish(EVENTS.MESSAGE.CREATED, {
                    messageCreated: { message }
                })

                return message
            }
        ),
        deleteMessage: combineResolvers(
            isAuthenticated,
            isMessageOwner,
            async (parent,{id},{models}) => {
                return await models.Message.destroy({ where: { id } })
        })
    },

    Message: {
        user: async (message,args,{models}) => {
            return await models.User.findById(message.userId)
        }
    },

    Subscription: {
        messageCreated: { // can access parent,args,context just like for Queries & Mutations
            subscribe: () => pubsub.asyncIterator(EVENTS.MESSAGE.CREATED)
        }
    }
}

