import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as Actions from '../../store/actions'
import ds from '../../dataspec2'
import arenastyle from './arenastyle'
// columnCalc inputs: parentCalcNode, 

// math-expression-evaluator
class CalcNodeForm extends Component {
    constructor(props) {
        super(props)
        const { dispatch } = props
        this.actions = bindActionCreators(Actions,dispatch)
        this.state = {
            nodeName: "",
            selectedTable: "",
            selectedTableColumns: [],
            expression: "",
            selectStart: 0,
            selectEnd: 0
        }
    }

    addToExpression(col,pos) {
        let { expression } = this.state
        let newExpression = [expression.slice(0,pos),col,expression.slice(pos)].join('')
        this.setState({expression:newExpression})
    }

    createCalcNode() {
        console.log('createCalcNode::this.props: ',this.props)
        let { x, y } = this.props
        let { nodeName, expression } = this.state
        // validate expression
        // when creating calcNode here, there is no parentCalcNode yet
        let inputs = {column:nodeName,expression,expressionName:this.state.nodeName,parentCalcNode:""}
        this.actions.addNode(nodeName,x,y,"columnCalc",inputs,{})
        let nodeKeys = Object.keys(this.props.nodes)
        let currentNodeID = nodeKeys[nodeKeys.length-1]
        console.log('CalcNodeForm::createCalcNode')
        console.log('currentNodeID: ',currentNodeID)
        //if (prevExpressionBank.length>0) this.actions.addLink(prevNodeID,currentNodeID,"parentCalcNode")
        this.actions.updateCalcTable()
        this.actions.nodeSelectorOff()
    }

    render() {
        const { dbTablesMeta } = this.props

        const expCalcButton = (label,op,key) => <li key={key}><button onClick={()=>this.addToExpression(op,this.state.expression.length)} style={{...buttonAddColumn,backgroundColor:'#22a'}}>{label}</button></li>
        const opCalcButton = (op,key) => <li style={{float:'left'}} key={key}><button style={opButton} onClick={()=>this.addToExpression(op,this.state.expression.length)}>{op}</button></li>

        const tableButtons = () => {
            let buttonList = []
            Object.keys(dbTablesMeta).forEach((table,index) => {
                if (!ds.tablesForCalcs.includes(table)) return
                let tableColumns = []
                dbTablesMeta[table].forEach(col => {
                    tableColumns.push(col.name)
                })
                buttonList.push(<li key={index}><button onClick={()=>{
                    this.setState({selectedTable:table,selectedTableColumns:tableColumns})
                }} style={{...buttonAddNode,backgroundColor: this.state.selectedTable===table?'#266a2e':'#121'}}>{table}</button></li>)
            })
            return <ul>{buttonList}</ul>
        }

        const columnButtons = () => {// should include others like: presentdate,yearsbetween,columnsum,columnavg,etc
            if (this.state.selectedTable === "") return <p style={{color:'white'}}>Columns</p>
            let columnList = []
            this.state.selectedTableColumns.forEach((col,index) => {
                if (!ds.allColumns.includes(col)) return
                columnList.push(<li key={index}><button onClick={()=>this.addToExpression(col,this.state.expression.length)} style={buttonAddColumn}>{col}</button></li>)
            })
            return <ul>{columnList}</ul>
        }

        const expButtons = () => {
            let buttons = []
            buttons.push(expCalcButton("Count If","countif(<statement>)",0))
            buttons.push(expCalcButton("Sum If","sumif(<statement>)",1))
            buttons.push(expCalcButton("Column Sum","columnsum(<column>)",2))
            buttons.push(expCalcButton("Column Average","columnavg(<column>)",3))            
            buttons.push(expCalcButton("Column Average","columnavg(<column>)",4))
            return <ul>{buttons}</ul>
        }

        const createCalcNodeButton = this.state.nodeName==="" || this.state.expression==="" ? null : <button style={{...buttonAddNode,backgroundColor:'#044',height:'30px'}} onClick={e=>{
            this.createCalcNode()
        }}>Create Node</button>
        const clearButton = <button style={opButton} onClick={()=>this.setState({expression:""})}>Reset</button>

        const operatorButtons = () => {
            let buttons = []
            buttons.push(opCalcButton("( ",1))
            buttons.push(opCalcButton(" )",2))
            buttons.push(opCalcButton(" + ",3))
            buttons.push(opCalcButton(" = ",4))
            buttons.push(opCalcButton(" x ",5))
            buttons.push(opCalcButton(" / ",6))
            buttons.push(opCalcButton(" ^ ",7))
            return <ul>{buttons}</ul>
        }

        const logicButtons = () => {
            let buttons = []
            buttons.push(opCalcButton(" = ",1))
            buttons.push(opCalcButton(" > ",2))
            buttons.push(opCalcButton(" >= ",3))
            buttons.push(opCalcButton(" < ",4))
            buttons.push(opCalcButton(" <= ",5))
            return <ul>{buttons}</ul>
        }

        // cursor position & selection: <https://ourcodeworld.com/articles/read/282/how-to-get-the-current-cursor-position-and-selection-within-a-text-input-or-textarea-in-javascript>
        // highlight keywords, other things, maybe use regex for special highlighting, autofill-lists could be super useful
        const expressionPanel = () => {
            if (this.state.selectedTable === "") return <p style={{color:'white'}}>Select Table to Unlock</p>
            return <div>
                <label>Column Calculation:</label><input id="exp" onChange={e=>{this.setState({expression:e.target.value}),console.log("e.target",e.target)}} className="rq-form-element" value={this.state.expression} style={{color:'#ff8',resize:'both',overflow:'auto'}} type="text"></input>
                <label>Column Name:</label><input id="exp" onChange={e=>{this.setState({nodeName:e.target.value})}} className="rq-form-element" value={this.state.nodeName} style={{color:'#ff8',resize:'both',overflow:'auto'}} type="text"></input>
                { createCalcNodeButton }
                { clearButton }
                { operatorButtons() }
                <p style={{marginTop:0,marginBottom:0}}>.</p>
                { logicButtons() }
                <p style={{marginTop:0,marginBottom:0}}>.</p>
                <p style={{fontWeight:'bold',color:'#aaa',fontSize:'14px'}}>Examples:</p>
                <p style={{color:'#aaa',fontSize:'14px',marginTop:0,marginBottom:0}}>2*5/10</p>
                <p style={{color:'#aaa',fontSize:'14px',marginTop:0,marginBottom:0}}>yearsbetween(dob,present)</p>
                <p style={{color:'#aaa',fontSize:'14px',marginTop:0,marginBottom:0}}>columnsum(faceamount)</p>
            </div>
        }

        return <div className="grid-container" style={{...millerColumns,resize:'both',overflow:'auto',width:500}}>
            <div className="grid-item" style={{width:150}}>{ tableButtons() }</div>
            <div className="grid-item" style={{width:150}}>{ columnButtons() }{ expButtons() }</div>
            <div className="grid-item" style={{width:200}}>{ expressionPanel() }</div>
            </div>
    }
}

const mapStateToProps = state => ({
    dbTablesMeta: state.dbTablesMeta,
    nodes: state.nodes
})

export default connect(mapStateToProps)(CalcNodeForm)

const {buttonAddNode,buttonAddColumn,millerColumns,opButton} = arenastyle
