import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as Actions from '../../store/actions'
import FilterForm from './FilterForm'
import FilterForm2 from './FilterForm2'
import CalcNodeForm from './CalcNodeForm'
import ds from '../../dataspec2'
import arenastyle from './arenastyle'
import nodefuncs from './nodefuncs'

class ActiveNodeOptions extends Component {
    constructor(props) {
        super(props)
        const { dispatch } = props
        this.actions = bindActionCreators(Actions,dispatch)
        this.state = {
            showFilterForm: false,
            showCalcForm: false
        }
    }

    componentWillReceiveProps({nodes,dbTablesMeta}) {
        this.nf = new nodefuncs(nodes,dbTablesMeta,this.actions)
    }

    createTableVectorNode(name,x,y,func,inputs,inputTypes) {
        //this.actions.addNode(name,x,y,func,inputs,inputTypes)
        this.nf.createNode(name,x,y,func,inputs,inputTypes)
        this.actions.updateCalcTable()
        this.actions.nodeSelectorOff()
        
    }

    createExtensionTableNode(name,x,y,func,inputs,inputTypes) {
        this.actions.addNode(name,x,y,func,inputs,inputTypes)
        this.actions.updateCalcTable()
        this.actions.nodeSelectorOff()
    }

    createCalcNode(name,x,y,parentCalc,expressionBank,inputTypes={}) {
        this.nf.createCalcNode(name,x,y,parentCalc,expressionBank)
    }

    render() {
        let { activeNodeID, nodes, dbTablesMeta } = this.props // for nodeMenu
        let activeNode = nodes[activeNodeID]
        let { func } = activeNode
        let isTable = func==="getDBTable" || func==="filterTable" || func==="extensionTable"
        /// func --> deriv nodes
        console.log(`derivNodes[${func}]: ${ds.func[func].derivNodes}`)
        
        let originalTable // should be name not 'node_x'
        if (activeNode.func === "getDBTable") {
            originalTable = activeNode.inputs.table
        } else {
            originalTable = activeNode.inputs.originalTable
        }

        let expressionBank = []
        if (func === "columnCalc") {
            /// option to add a deriv columnCalc that inherits this expressionBank
            expressionBank = activeNode.inputs.expressionBank
        }

        let nodeName = activeNode.name

        let top = activeNode.y + 0 // 40
        let left = activeNode.x + 50 // 0

        const tableFilterButton = (!isTable) ? null : <button onClick={e => {
            // name should be condition (ex "age>25, gender:male")
            this.setState({showFilterForm:true})
            //this.createNode("Filter",left,top,"tableFilter",{table:nodeName,conditions:{gender:"m",age:">25"}},{})
        }} style={{...buttonAddNodeForm}}><i className="material-icons" style={{fontSize:'10px',marginRight:'10px'}}>cloud_download</i>Filter Table</button>

        const tableVectors = () => {
            if (!isTable) return null
            let columns = []
            let tableName
            switch(func) {
                case "filterTable":
                tableName = activeNode.inputs.originalTable
                break

                case "extensionTable":
                tableName = activeNode.inputs.originalTable
                break

                default:
                tableName = activeNode.inputs.table
                break
            }

            if (!dbTablesMeta[tableName]) return null

            let vectorButtons = []

            dbTablesMeta[tableName].forEach((col,index) => {
                let { name, dataType } = col
                if (ds.nodeInputs.ignoreColumns.includes(name)) return
                columns.push({ name, dataType })
                vectorButtons.push(<li key={index}><button onClick={()=>this.createTableVectorNode(name,left,top+20,"tableVector",{table:activeNodeID,column:name},{table:"text",column:"text"})} style={{...buttonAddNode}}>{name}</button></li>)
            })
            return <ul>{vectorButtons}</ul>
        }

        const extensionTableButton = () => {
            return <button style={buttonAddNodeForm} onClick={()=>this.createExtensionTableNode("Ext_"+nodeName,left,top+20,"extensionTable",{parentTable:activeNodeID,originalTable,expressionBank:{}})}>Extension Table</button>
        }

        const calcNodeButton = () => {
            return <button style={buttonAddNodeForm} onClick={()=>this.setState({showCalcForm:true})}>Calc Node</button>
        }

        const mainButton = () => {
            return <button style={mainButtonStyle} onClick={()=>this.setState({showFilterForm:false,showCalcForm:false})}>Back To Main</button>
        }

        return <div style={{...menuStyle, left,top}}>
        <p style={{color:'#fff', fontSize:'8pt'}}>Node Options</p>
        { this.state.showCalcForm || this.state.showFilterForm ? mainButton() : null }
        { this.state.showFilterForm ? <FilterForm2 tableName={originalTable || nodeName} table={activeNodeID} x={left+100} y={top} /> : null }
        { this.state.showCalcForm ? <CalcNodeForm x={left} y={top} prevNodeID={activeNodeID} prevExpressionBank={expressionBank} /> : null }
        { !this.state.showFilterForm && !this.state.showCalcForm ? tableFilterButton : null }
        { !this.state.showCalcForm ? calcNodeButton() : null }
        { !this.state.showFilterForm && isTable && !this.state.showCalcForm ? extensionTableButton() : null }
        { isTable && !this.state.showFilterForm && !this.state.showCalcForm ? tableVectors() : null }
        { !this.state.showFilterForm ? <ul><button onClick={()=>{
            this.actions.removeNode(this.props.activeNodeID)
            this.actions.setActiveNode("")
            this.actions.updateCalcTable() // this should be updating nodeDependencies
            this.actions.activeNodeOptionsOff()
            }} style={buttonDelete}>Delete</button></ul> : null }
        </div>
    }
}

const mapStateToProps = state => ({
    activeNodeID: state.activeNodeID,
    nodes: state.nodes,
    dbTablesMeta: state.dbTablesMeta
})

export default connect(mapStateToProps)(ActiveNodeOptions)

const {buttonAddNode,buttonAddNodeForm,buttonDelete} = arenastyle

const menuStyle = {
    width: '150px',
    position:'absolute',
    boxShadow: '0 0 5px #ff8',
    top:50, left:50,
    borderStyle:'solid',
    borderWidth:'1px',
    borderColor:'blue',
    borderRadius:'5px',
    backgroundColor: 'rgba(24,24,48,0.8)'//'#224'
}

const mainButtonStyle = {
    //fontSize:'20px',
    //marginRight:'10px',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#ccc',
    backgroundColor: '#4202c2',
    borderRadius: 4
}
