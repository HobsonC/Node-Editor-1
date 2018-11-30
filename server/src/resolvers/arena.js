import { combineResolvers } from 'graphql-resolvers'
import { isAuthenticated } from './authorization'

export default {
    Query: {
        allArenaNames: async (parent,args,{models, sequelize}) => {
            const result = await models.Arena.lookupArenaNames()
            //console.log('result: ',result)
            return result
        },
        getArena: async (parent,args,{models, sequelize}) => {
            //console.log('getArena.args: ',args)
            return await models.Arena.lookupArena(args.arenaName)
        }
    },
    Mutation: {
        addArena: async (parent,args,{models, sequelize}) => {
            console.log('\naddArena\n')
            console.log('args: ',args)
            let {inputs} = args.nodeData[0]
            await models.Arena.enterArena(args.nodeData[0].arenaName,args.nodeData)
            console.log('typeof inputs =',typeof inputs)
            console.log('Object.keys(inputs)',Object.keys(inputs))
            return true
        }

    }
}