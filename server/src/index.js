import http from 'http'
import jwt from 'jsonwebtoken'
// require('dotenv').config()
import cors from 'cors'
import express from 'express'
import { ApolloServer, AuthenticationError } from 'apollo-server-express'

import models, { sequelize } from './models/index'
import schema from './schema/index'
import resolvers from './resolvers/index'

const SECRET = 'thisismysecretlalala'

const getMe = async req => {
    const token = req.headers['x-token']

    if (token) {
        try {
            return await jwt.verify(token,SECRET)
        } catch(e) {
            throw new AuthenticationError('Your session has expired. Log in again.')
        }
    }
}

const eraseDatabaseOnSync = true

const app = express()
app.use(cors())

const server = new ApolloServer({ // <---context stuff for resolvers goes in here
    typeDefs: schema,
    resolvers,
    context: async ({ req, connection }) => {
        if (connection) { // Subscriptions
            return { models }
        }
        if (req) { // Queries and Mutations
            const me = await getMe(req)
            return { models, me, secret: SECRET, sequelize }
        }
    }
})

server.applyMiddleware({ app, path: '/graphql' })

const httpServer = http.createServer(app)
server.installSubscriptionHandlers(httpServer)

sequelize.sync().then(async () => {
    httpServer.listen({ port: 8000 }, () => {
        console.log('apollo on http://localhost:8000/graphql')
    })
})

// not using
const createUsersWithMessages = async () => {
    await models.User.create(
        {
            username: 'Archie',
            email: 'archie@email.com',
            password: 'archie123',
            role: 'ADMIN',
            messages: [{ text: 'Going fishing today' }]
        },
        { include: [models.Message] }
    )

    await models.User.create(
        {
            username: 'Bettie',
            email: 'bettie@email.com',
            password: 'bettie123',
            messages: [ { text: 'Going hiking today' },
                        { text: 'Going biking today' }]
        },
        {
            include: [models.Message]
        }
    )
}