import { gql } from 'apollo-server-express'


export default gql`

extend type Query {
    allArenaNames: [String]!
    getArena(arenaName:String!): [NodeInfo]!
}

extend type Mutation {
    addArena(nodeData:[JSON]!): Boolean
}

type ArenaInfo {
    nodeInfos: [NodeInfo]!
}

type NodeInfo {
    arenaName: String!
    nodeID: String!
    name: String!
    x: Int!
    y: Int!
    func: String!
    inputs: JSON!
}
`

