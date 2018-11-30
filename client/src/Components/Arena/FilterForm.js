import React, {Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as Actions from '../../store/actions'
import ds from '../../dataspec'

// Appears on rt-clk filterTable
class FilterForm extends Component {
    constructor(props) {
        super(props)
        const { dispatch } = props
        this.actions = bindActionCreators(Actions,dispatch)
        this.state = {
            column: "",
            conditionType: "",
            conditionValue: 0,
            conditions: [], // [{gt:5},{lt:20},{gt:'node_2'}]
            columnTypeMap: new Map(),
            tableColumnType: new Map()
        }
    }

    componentWillMount() {
        const tableColumnType = new Map()
        Object.keys(this.props.dbTablesMeta).forEach(table => {
            let columnTypeMap = new Map()
            this.props.dbTablesMeta[table].forEach(t => {
                let { name, dataType } = t
                columnTypeMap.set(name,dataType)
            })
            tableColumnType.set(table,columnTypeMap)
        })
        this.setState({tableColumnType})
    }

    createNode(table,x,y) {
        let { conditionType, column, conditionValue } = this.state
        let inputs = {table,column,conditionType,conditionValue}
        this.actions.addNode(`${column} ${this.state.conditionType} ${conditionValue}`,x,y,"filterTable",inputs)
        this.actions.updateCalcTable()
        this.actions.activeNodeOptionsOff()
    }

    render() {
        console.log('FilterForm')
        const { tableName,table,x,y } = this.props
        const columns = this.props.dbTablesMeta[tableName]

        const selectColumn = () => {
            let columnSelections = []
            let index = 0
            columns.forEach(col => {
                const { name, dataType } = col
                if (ds.nodeInputs.ignoreColumns.includes(name)) return
                columnSelections.push(<option key={index++} value={name}>{name}</option>)
            })

            return  <select style={{...selectStyle}} className="browser-default" onChange={e=>this.setState({column: e.target.value})}>
                        <option value="">Select Column:</option>
                        { columnSelections }
                    </select>
            }

        const inputConditionValue = this.state.column !== "" && this.state.conditionType !== "" ? () => {
            //columnData
            return <div><label>x: </label>
                <input style={{color:'#ff8'}} onChange={e=>this.setState({conditionValue:e.target.value})} defaultValue={0}/>
            </div>
        } : () => null

        const selectConditionType = this.state.column === "" ? () => null : () => {
            let columnType = this.state.tableColumnType.get(tableName)
            let colType = columnType.get(this.state.column)
            console.log('this.state.column: ',this.state.column)
            console.log('ds.nodeInputs.conditionTypes[this.state.column]: ',ds.nodeInputs.conditionTypes[this.state.column])
            let conditions = ds.nodeInputs.conditionTypes[this.state.column] || ["="] // want diff per column

            let conditionSelections = []
            conditions.forEach((cond,index) => {
                console.log('cond: ',cond)
                console.log('index: ',index)
                conditionSelections.push(<option key={index} value={cond}>{cond}</option>)
            })

            return <div><select style={{...selectStyle}} className="browser-default" onChange={e=>this.setState({conditionType: e.target.value})}>
                <option value="">Select Condition:</option>
                { conditionSelections }
                </select>
                { ds.nodeInputs.conditionRequiresInput[this.state.column] ? inputConditionValue() : null }
            </div>
        }

        return <div style={{color:'white'}}>
            { selectColumn() }
            { selectConditionType() }
            { this.state.conditionType !== "" ? <button onClick={()=>this.createNode(table,x,y)} style={{...buttonAddNode}}>Add Filter Node</button> : null }
            <button style={{...buttonDelete}}>Go Back</button>
            <p>this.state.conditionType: {this.state.conditionType}</p>
        </div>
    }
}

const mapStateToProps = state => ({
    dbTablesMeta: state.dbTablesMeta
})

export default connect(mapStateToProps)(FilterForm)

const buttonDelete = {
    borderRadius: 4,
    opacity: 1,
    width: '100px',
    color: '#ff8',
    //textShadow: '0 0 1px #ff0',
    fontSize: '14px',
    fontWeight: 'bold',
    backgroundColor: '#622'
}

const buttonAddNode = {
    borderRadius: 4,
    opacity: 1,
    width: '100px',
    color: '#ff8',
    fontSize: '14px',
    fontWeight: 'bold',
    backgroundColor: '#242'
}

const selectStyle = {
    height: '32px',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#ff8',
    backgroundColor: '#124'
}

/*
filterTable
extendTable (add columns of calc'd values, ex age)

*/