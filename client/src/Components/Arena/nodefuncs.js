class nodefuncs {
    constructor(nodes,dbTablesMeta,actions) {
        this.nodes = nodes
        this.dbTablesMeta = dbTablesMeta
        this.actions = actions
    }

    createNode(name,x,y,func,inputs,inputTypes) {
        this.actions.addNode(name,x,y,func,inputs,inputTypes)
        this.actions.updateCalcTable()
        this.actions.nodeSelectorOff()
    }

    createTableVectorNode(name,x,y,func,inputs,inputTypes) {
        this.actions.updateCalcTable()
        this.actions.nodeSelectorOff()
    }

    createCalcNode(name,x,y,expression,parentCalc="",expressionBank=[]) {///
        let inputs = { parentCalc, expressionBank }
        this.actions.addNode(name,x,y,"columnCalc",inputs,{})
        this.actions.updateCalcTable()
        this.actions.nodeSelectorOff()
    }
}

export default nodefuncs