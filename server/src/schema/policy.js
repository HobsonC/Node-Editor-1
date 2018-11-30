import { gql } from 'apollo-server-express'


export default gql`

extend type Query {
    allPolicies: [Policy]!
    policy(policynumber:Int!): Policy!
    policies(conditions: JSON!): [Policy]!

    policiesFaceAmount(conditions: JSON): Int!
}

type Policy {
    policynumber: Int!
    name: String!
    dob: String!
    dop: String!
    gender: String!
    smokingstatus: String!
    faceamount: Int!
    createdAt: String!
    updatedAt: String!
}
`
