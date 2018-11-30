import * as ActionTypes from './action-types'

// NODES
// Nodes have a single output
// However tables have multiple columns that can be output
// 
// SubTable(subListOfColumns)
//                      func        inputs
// Table Node types:    getDBTable  db query (preloaded)
//                      subTable    another table & selected columns
//                      filterTable another table & conditions(colNames,colConditions))

export const addNode = (name,x,y,func,inputs,inputTypes={}) => {
    return {
        type: ActionTypes.ADD_NODE,
        name, x, y,
        func, inputs, inputTypes
    }
}

export const removeNode = id => {
    return {
        type: ActionTypes.REMOVE_NODE,
        id
    }
}

export const clearAllNodes = () => {
    return {
        type: ActionTypes.CLEAR_ALL_NODES
    }
}

export const setNodes = newNodes => {
    return {
        type: ActionTypes.SET_NODES,
        newNodes
    }
}

// Node Selector
export const nodeSelectorOn = () => {
    return {
        type: ActionTypes.NODE_SELECTOR_ON
    }
}

// Active Node
export const setActiveNode = id => {
    return {
        type: ActionTypes.SET_ACTIVE_NODE,
        id
    }
}

export const activeNodeOptionsOn = () => {
    return {
        type: ActionTypes.ACTIVE_NODE_OPTIONS_ON
    }
}

export const activeNodeOptionsOff = () => {
    return {
        type: ActionTypes.ACTIVE_NODE_OPTIONS_OFF
    }
}

export const nodeSelectorOff = () => {
    return {
        type: ActionTypes.NODE_SELECTOR_OFF
    }
}

// LINK
export const addLink = (fromNode,toNode,toInput) => {
    return {
        type: ActionTypes.ADD_LINK,
        fromNode, toNode, toInput
    }
}

export const updateCalcTable = () => {
    return {
        type: ActionTypes.UPDATE_CALC_TABLE
    }
}

export const changeNodePosition = (id,x,y) => {
    return {
        type: ActionTypes.CHANGE_NODE_POSITION,
        id,x,y
    }
}

export const updateDBTablesMeta = infosArray => {
    return {
        type: ActionTypes.UPDATE_DBTABLES_META,
        infosArray
    }
}

export const updateResults = results => {
    return {
        type: ActionTypes.UPDATE_RESULTS,
        results
    }
}