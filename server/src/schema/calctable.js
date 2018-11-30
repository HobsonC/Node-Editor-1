import { combineResolvers } from 'graphql-resolvers'
import { AuthenticationError, UserInputError } from 'apollo-server'

import { gql } from 'apollo-server-express'

export default gql`

extend type Query {
    calcResultsTable(calcTable:[JSON]!): JSON!
}

`