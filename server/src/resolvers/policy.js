import { combineResolvers } from 'graphql-resolvers'
import { AuthenticationError, UserInputError } from 'apollo-server'
import GraphQLJSON from 'graphql-type-json'
import Sequelize from 'sequelize'

const Op = Sequelize.Op
//let { gt } = Op

export default {
    Query: {
        allPolicies: async (parent,args,{models}) => {
            //console.log('models.Policy: ',models.Policy)
            return await models.Policy.findAll()
        },
        policy: async (parent,{policynumber},{models}) => {
            return await models.Policy.find({
                where: { policynumber }
            })
        },
        policies: async (parent,{conditions},{models}) => {
            //console.log('conditions: ',conditions)
            return await models.Policy.findAll({where: conditions })
        },
        policiesFaceAmount: async (parent,{conditions},{models}) => {
            return await models.Policy.findAll({where: conditions})
                            .then(pols => {
                                let sumFA = 0
                                pols.forEach(({faceamount}) => sumFA += faceamount)
                                return sumFA
                            }).catch(err => 0)
        }
    },
    JSON: GraphQLJSON
}


/* Example client-side queries

    policies(conditions: {faceamount: {gt: 150000}}) {
        policynumber
        faceamount
    }

    policiesFaceAmount(conditions: { faceamount: { gt: 410000 } })
*/

