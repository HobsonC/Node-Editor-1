import gql from 'graphql-tag'
import * as rgx from './typeregex'

export default {
    calcResultsTable: calcTable => {
        console.log('calcTable: ',calcTable)
        let nodesObj = []

        calcTable.forEach(node => {
            let nodeObj = {}
            nodeObj.id = node.id
            nodeObj.func = node.func
            
            let inputsObj = {}
            let inputKeys = Object.keys(node.inputs)
            inputKeys.forEach((key,index) => {
                inputsObj[key] = node.inputs[key]
            })
            nodeObj.inputs = inputsObj
            nodesObj.push(nodeObj)
            
        })
        console.log('nodesObj: ',nodesObj)
        
        const nodesObjFormatted = rgx.removeQuotesOnProps(JSON.stringify(nodesObj))
        console.log('nodesObjFormatted: ',nodesObjFormatted)

        return gql`query { 
            calcResultsTable(calcTable:${nodesObjFormatted}) 
        }`
    },
    allTableNames: () => gql`
        query {
            allTableNames
        }`,
    tableNames: tableType => gql`
        query {
            tableNames(${tableType})
        }`,
    tableInfo: table => gql`
        query {
            tableInfo(tableName: "${table}") {
                name
                columns {
                    name
                    dataType
                }
            }
        }`,
    tablesInfo: tables => gql`
        query {
            tablesInfo(tableNames: ${stringListToArray(tables)}) {
                name
                columns {
                    name
                    dataType
                }
            }
        }`,
    getArena: arenaName => gql`
        {
            getArena(arenaName:"${arenaName}") {
              arenaName
              nodeID
              name
              func
              x
              y
              inputs
            }
          }`,
    getArenaNames: () => gql`
        {
            allArenaNames
        }`
}

const stringListToArray = stringList => {
    let result = `[`
    let index = 0
    stringList.forEach(s => {
        index++
        result += `"` + s + `"` + (index < stringList.length ? `,` : ``)
    })
    result += `]`
    return result
}
