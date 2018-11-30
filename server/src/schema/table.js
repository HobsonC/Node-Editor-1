import { gql } from 'apollo-server-express'

export default gql`

extend type Query {
    allTableNames: [String]!
    tableNames(tableType:String!): [String]!
    tableInfo(tableName:String!): TableInfo!
    tablesInfo(tableNames:[String]!): [TableInfo]!
}

type TableInfo {
    name: String!
    columns: [ColumnInfo]!
}

type ColumnInfo {
    name: String!
    dataType: String!
}
`

// tableInfos(table)