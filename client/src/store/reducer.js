// CalcTable:   ID | Function | Inputs | Result (server-side)
// Server saves ResultTable(time,[ID|Function|Inputs|Result])
// ...then sends to client, new tab added: ResultView

import * as ActionTypes from './action-types'

const nextNodeID = () => {
    let currentIDNum = 1
    
    return () => {
        return `node_${currentIDNum++}`
    }
}
const getNextID = nextNodeID()

const initialState = {
    devMode: false,
    activeNodeID: "",
    nodeSelectorOpen: false,
    activeNodeOptionsOpen: false,
    nodes: {},
    nodeDependencies: new Map(),
    calcTable: [],
    dbTablesMeta: {},
    nodeResults: {}
}

export default function Reducer(state=initialState,action) {
    switch(action.type) {
        case ActionTypes.ADD_NODE:
        {
            let { name, x, y, func, inputs, inputTypes } = action
            let newID = getNextID()
            let newNodes = state.nodes
            newNodes[newID] = { name, x, y, func, inputs, inputTypes }

            return Object.assign({},state,{
                nodes: newNodes,
                activeNodeID: newID
            })
        }

        case ActionTypes.REMOVE_NODE:
        {
            let { id } = action
            let newNodes = state.nodes
            delete newNodes[id]

            return Object.assign({},state,{
                nodes: newNodes
            })
        }

        case ActionTypes.CLEAR_ALL_NODES:
        {
            return Object.assign({},state,{
                activeNodeID: "",
                nodeSelectorOpen: false,
                activeNodeOptionsOpen: false,
                nodes: {},
                nodeDependencies: new Map(),
                calcTable: []
            })
        }

        case ActionTypes.SET_NODES:
        {
            action.newNodes // array of node objects
            let newNodesObj = {}
            action.newNodes.forEach(({nodeID,name,x,y,func,inputs}) => {
                newNodesObj[nodeID] = {name,x,y,func,inputs}
            })

            // make sure future ids are not overlapping
            const nodeIDs = action.newNodes.map(({nodeID}) =>eval(nodeID.split('_')[1]))
            const maxIDNum = Math.max(...nodeIDs)
            let safetyCounter = 0
            while (eval(getNextID().split('_')[1])<maxIDNum && safetyCounter<1000)
           {
               safetyCounter++
            }

            return Object.assign({},state,{
                activeNodeID: "",
                nodeSelectorOpen: false,
                activeNodeOptionsOpen: false,
                nodes: newNodesObj,
                nodeDependencies: new Map(),
                calcTable: []
            })
        }

        case ActionTypes.CHANGE_NODE_POSITION:
        {
            let { id, x, y } = action
            let newNodes = state.nodes
            newNodes[id] = Object.assign({},state.nodes[id],{x,y})

            return Object.assign({},state,{
                nodes: newNodes
            })
        }

        case ActionTypes.SET_ACTIVE_NODE:
        {
            return Object.assign({},state,{
                activeNodeID: action.id
            })
        }

        case ActionTypes.ADD_LINK:
        {
            let { fromNode, toNode, toInput } = action
            let newToNode = state.nodes[toNode]
            let newNodes = state.nodes

            newToNode.inputs[toInput] = fromNode
            newNodes[toNode] = newToNode

            return Object.assign({},state,{
                nodes: newNodes
            })
        }

        case ActionTypes.NODE_SELECTOR_ON:
        {
            return Object.assign({},state,{
                nodeSelectorOpen: true
            })
        }

        case ActionTypes.NODE_SELECTOR_OFF:
        {
            console.log('nodeSelectorOff')
            return Object.assign({},state,{
                nodeSelectorOpen: false
            })
        }

        case ActionTypes.ACTIVE_NODE_OPTIONS_ON:
        {
            return Object.assign({},state,{
                activeNodeOptionsOpen: true
            })
        }

        case ActionTypes.ACTIVE_NODE_OPTIONS_OFF:
        {
            console.log('activeNodeOptionsOff')
            return Object.assign({},state,{
                activeNodeOptionsOpen: false
            })
        }

        case ActionTypes.UPDATE_CALC_TABLE:
        {
            let newCalcTable = []
            let { newOrder, nodeDeps } = orderOfNodes(state.nodes)

            newOrder.forEach(nodeID => {
                let {func,inputs} = state.nodes[nodeID]
                /// expressionBank
                if (func==="columnCalc") {
                    inputs["expressionBank"] = getExpressionBank(state.nodes,nodeID)
                    //inputs["expressionNameBank"] = getExpressionNameBank(state.nodes,nodeID)
                    
                }
                
                newCalcTable.push({id:nodeID,func,inputs})
            })

            return Object.assign({},state,{
                calcTable: newCalcTable,
                nodeDependencies: nodeDeps
            }) // getdb_table_allPolicies
        }

        case ActionTypes.UPDATE_DBTABLES_META:
        {
            let { infosArray } = action
            let newMeta = {}
            infosArray.forEach(info => {
                let { name, columns } = info
                newMeta[name] = columns
            })
            

            return Object.assign({},state,{
                dbTablesMeta: newMeta
            })
        }

        case ActionTypes.UPDATE_RESULTS:
        {
            return Object.assign({},state,{
                nodeResults: action.results
            })
        }

        default:
        return state
    }
}



// UTILITY FUNCTIONS

const orderOfNodes = nodes => {
    let nodeOrder = []
    // Create nodeDeps_______________________________
    let nodeDeps = {}
    let nodeDepsMap = new Map()
    let nodesRemaining = nodes
    Object.keys(nodes).forEach(nodeKey => {
        let depNodes = new Array()
        Object.keys(nodes[nodeKey].inputs).forEach(inputKey => {
            let input = nodes[nodeKey].inputs[inputKey]
            if (typeof input === "string" && input.startsWith("node_")) {
                depNodes.push(input)
            }
        })
        nodeDeps[nodeKey] = [...depNodes]
        nodeDepsMap.set(nodeKey,[...depNodes])
    })

    // Iterate nodeDeps until empty_______________________
    let safetyCounter = 0
    let depsRemaining = 0

    let nodeDepsTemp = nodeDeps
    Object.keys(nodeDepsTemp).forEach(key => depsRemaining += Math.max(1,nodeDepsTemp[key].length))
    while(depsRemaining > 0 && safetyCounter < 100) {
        // Find nodes with no node deps...
        Object.keys(nodeDepsTemp).forEach(key => {
            //console.log('(key, nodeDepsTemp[key]): ',key,nodeDepsTemp[key])

            if (nodeDepsTemp[key].length === 0) {
                // ...push them into nodeOrder
                nodeOrder.push(key)
                // ...remove them as dep from other nodes
                //console.log(`nodeDepsTemp BEFORE: ${Object.keys(nodeDepsTemp).map(k=>k+": ["+nodeDepsTemp[k]+"]")}`)
                //console.log(`REMOVING ${key}`)
                Object.keys(nodeDepsTemp).forEach(nKey => nodeDepsTemp[nKey].includes(key) ? nodeDepsTemp[nKey].splice(nodeDepsTemp[nKey].indexOf(key),1) : {})
                //console.log(`nodeDepsTemp AFTER: ${Object.keys(nodeDepsTemp).map(k=>k+": ["+nodeDepsTemp[k]+"]")}`)
            }
        })

        // update depsRemaining & safetyCounter
        depsRemaining = 0
        Object.keys(nodeDeps).forEach(key => depsRemaining += nodeDepsTemp[key].length)
        safetyCounter++

        if (depsRemaining === 0) { // last chance to do stuff
            // Add remaining nodes to nodeOrder
            Object.keys(nodes).forEach(nKey => {
                if (!nodeOrder.includes(nKey)) nodeOrder.push(nKey)
            })
        }
    }

    return { newOrder: nodeOrder, nodeDeps: nodeDepsMap }
}

const getExpressionBank = (nodes,id) => {
    let {expression,expressionName,parentCalcNode} = nodes[id].inputs
    let result = {}
    if (parentCalcNode===""||!parentCalcNode) {
        result[expressionName] = expression
        return result
    }
    else {
        result = getExpressionBank(nodes,parentCalcNode)
        result[expressionName] = expression
        return result
    }
}

const getObjString = obj => {
    if (typeof obj !== 'object') return obj
    return '{' + Object.keys(obj).map(key => `${key}: ${getObjString(obj[key])}`) + '}'
}

/*const getExpressionNameBank = (nodes,id) => {
    let {expressionName,parentCalcNode} = nodes[id].inputs
    if (parentCalcNode===""||!parentCalcNode) return [expressionName]
    else return [...getExpressionNameBank(nodes,parentCalcNode),expressionName]
}*/
