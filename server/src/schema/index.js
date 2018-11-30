import { gql } from 'apollo-server-express'
// >npm i --save graphql-type-json

import arenaSchema from './arena'
import tableSchema from './table'
import policySchema from './policy'
import calcTableSchema from './calctable'

const linkSchema = gql`
    scalar JSON

    type Query {
        _: Boolean
    }

    type Mutation {
        _: Boolean
    }

    type Subscription {
        _: Boolean
    }
`

export default [linkSchema, policySchema, tableSchema,calcTableSchema,arenaSchema]
