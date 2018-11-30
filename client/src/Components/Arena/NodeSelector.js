import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as Actions from '../../store/actions'
import { graphql, Query } from 'react-apollo'
import db from '../../db_queries'
import CalcNodeForm from './CalcNodeForm'
import astyle from './arenastyle'
import ui from '../../style/ui'

class NodeSelector extends Component {
    constructor(props) {
        super(props)
        const { dispatch } = props
        this.actions = bindActionCreators(Actions,dispatch)
        this.state = {
            typeA: "",
            showAllDBTables: false
        }
    }

    createNode(name,x,y,func,inputs,inputTypes={}) {
        this.actions.addNode(name,x,y,func,inputs,inputTypes)
        this.actions.updateCalcTable()
        this.actions.nodeSelectorOff()
    }

    render() {
        // if active node --> fromNode = activeNode
        //                      toNode = newNode
        //                toNode.input = selection after selecting node type
        let { top, left } = this.props

        const listAllDBTables = () => {
            console.log('dbTablesMeta: ',this.props.dbTablesMeta)
            let tableButtons = []
            let index = 0
            Object.keys(this.props.dbTablesMeta).forEach(tableName => {
                tableButtons.push(<button onClick={()=>{
                    this.createNode(tableName,left,top,"getDBTable",{table:tableName},{table:"text"})
                }} style={{...buttonAddNode}} key={index++}>{tableName}</button>)
            })
            return <div style={{display:'grid',gridTemplateColumns:'150px'}}>{tableButtons}</div>
        }

        const nodeButton = (label,type,icon) => <li style={{display:'inline'}}>
        <button onMouseOver={e=>e.target.style.backgroundColor=`#44f`} onMouseLeave={e=>e.target.style.backgroundColor=this.state.typeA===type ? 'blue' : '#055'} onClick={()=>this.setState({typeA:type})} style={{...buttonAddNode,textAlign:'left',backgroundColor: this.state.typeA===type ? 'blue' : '#055'}}><i className="material-icons" style={{fontSize:'20px',marginRight:'10px'}}>{icon}</i>{label}</button>
        </li>

        const buttonDBTable = nodeButton("DB Table","AllDBTables","apps")
        const buttonMap = nodeButton("Map","Map","exit_to_app")
        const buttonFilter = nodeButton("Filter","Filter","horizontal_split")
        const buttonReduce = nodeButton("Reduce","Reduce","filter_list")
        const buttonCalc = nodeButton("Calc","Calc","functions")
        const buttonClearAll = <li style={{display:'inline'}}><button onClick={()=>this.actions.clearAllNodes()} style={ui.button({type:'negate'})}><i className="material-icons" style={{fontSize:'10px',marginRight:'10px'}}>delete_outline</i>Clear All</button></li>
        const rowA = <ul>{buttonDBTable}{buttonMap}{buttonFilter}{buttonReduce}{buttonCalc}{buttonClearAll}</ul>

        // Reduce
        const buttonSum = <li key={1} style={{display:'inline'}}><button onClick={e => {
            this.createNode("Sum",left,top,"sumVector",{vector:""},{vector:"number"})
        }} style={{...buttonAddNode}}><i className="material-icons" style={{fontSize:'10px',marginRight:'10px'}}>cloud_download</i>Sum</button></li>
        const rowReduce = <ul>{buttonSum}</ul>

        return <div style={{...menuStyle,top,left}}>
            { rowA }
            { this.state.typeA === "Reduce" ? rowReduce : null }
            { this.state.typeA === "AllDBTables" ? listAllDBTables() : null }
            { this.state.typeA === "Calc" ? <CalcNodeForm x={left} y={top} /> : null }
        </div>
    }
}

const mapStateToProps = state => ({
    nodes: state.nodes,
    activeNodeID: state.activeNodeID,
    dbTablesMeta: state.dbTablesMeta
})

export default connect(mapStateToProps)(NodeSelector)

const {menuStyle,buttonAddNode,buttonDelete} = astyle

