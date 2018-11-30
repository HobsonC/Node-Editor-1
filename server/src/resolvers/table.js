import { combineResolvers } from 'graphql-resolvers'
import { isAuthenticated } from './authorization'
// d3 radial menu
export default {
    Query: {
        allTableNames: async (parent,args,{models, sequelize}) => {
            return await models.Table.getAllTableNames()
        },
        tableNames: async (parent,{tableType},{models, sequelize}) => {
            return models.Table.getTableNames(tableType)// await sequelize.query
        },
        tableInfo: async (parent,{tableName},{models, sequelize}) => {
            return await models.Table.getTableInfo(tableName)
        },
        tablesInfo: async (parent,{tableNames},{models, sequelize}) => {
            return await models.Table.getTablesInfo(tableNames)
        }
    }
}