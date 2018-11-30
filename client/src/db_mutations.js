import gql from 'graphql-tag'
import * as rgx from './typeregex'

export default {
    saveArena: (arenaName,nodes) => {
        const arenaNodes = []
        Object.keys(nodes).map(nodeID => {
            let {name,x,y,func,inputs} = nodes[nodeID]
            arenaNodes.push([
                `${arenaName}`,
                `${nodeID}`,
                `${name}`,
                `${x}`,
                `${y}`,
                `${func}`,
                `${inputs}`
            ])

        })

        let mut = `mutation {
            addArena(nodeData: [`
        
        // {arenaName,nodeID,name,x,y,func,inputs}
        let nodeInfos = Object.keys(nodes).map(nodeID => {
            let {name,x,y,func,inputs} = nodes[nodeID]
            console.log('inputs: ',inputs)
            return `{arenaName:"${arenaName}",
                     nodeID: "${nodeID}",
                     name: "${name}",
                     x: ${x},
                     y: ${y},
                     func: "${func}",
                     inputs: ${objToString(inputs)}
        }`
        })
        
        mut += nodeInfos + ']'
        mut += `)
        }`

        console.log('mut: ',mut)

        return gql`${mut}`
    }
}

const objToString = obj => {
    if (typeof obj === 'object') {
        return '{' + Object.keys(obj).map(key => `${key}: ${objToString(obj[key])}`).join(',') + '}'
    }
    if (typeof obj === 'string') return `"${obj}"`
    return obj
}



