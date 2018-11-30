import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as Actions from '../../store/actions'
import { bindActionCreators } from 'redux'
import ds from '../../dataspec2'
import arenastyle from './arenastyle'

//        DATASPEC-CENTRIC
// Do not try to read db for table/column info, just use the dataspec
// This is for all tables (ie getDBTable, tableSelect, filterTable)

class FilterForm2 extends Component {
    constructor(props) {
        super(props)
        const { dispatch } = props
        this.actions = bindActionCreators(Actions,dispatch)
        this.state = {
            tableColumns: [],
            columnSelected: "",
            valueSelected: null,
            valueComparer: "="
        }
    }

    componentWillMount() {
        console.log('this.props.tableName: ',this.props.tableName)
        if (this.props.tableName.startsWith("node_")) {

        }
        console.log('this.props.dbTablesMeta[this.props.tableName]: ',this.props.dbTablesMeta[this.props.tableName])
        this.setState({tableColumns: this.props.dbTablesMeta[this.props.tableName]})
    }

    createNode(table,x,y) {
        const { columnSelected, valueSelected, valueComparer } = this.state
        let originalTable = this.props.tableName

        const inputs = { parentTable:table, originalTable, column: columnSelected, comparer: valueComparer, value: valueSelected }
        this.actions.addNode(`${columnSelected} ${valueComparer} ${valueSelected}`,x,y,"filterTable",inputs)
        this.actions.updateCalcTable()
        this.actions.activeNodeOptionsOff()
    }

    render() {
        const { tableName,table,x,y } = this.props

        const selectColumn = () => {
            let columnSelections = []
            this.state.tableColumns.forEach((col,index) => {
                let { name, dataType } = col
                if (!ds.allColumns.includes(name)) return
                columnSelections.push(<option key={index} value={name}>{name}</option>)
            })
            return <select style={{...selectStyle}} className="browser-default" onChange={e=>this.setState({columnSelected:e.target.value,valueSelected:null})}>
            <option value="">Select Column:</option>
            {columnSelections}
            </select>
        }

        const inputValue = this.state.columnSelected === "" ? () => null : () => {
            const { input, values, min, max } = ds.columnInputs[this.state.columnSelected]

            if (input === "date_picker") {
                let comparerSelector = <select style={{...selectStyle}} className="browser-default" onChange={e=>this.setState({valueComparer:e.target.value})}>
                <option key={0} value="=">Select Comparison:</option>
                <option key={1} value="=">{"= x"}</option>
                <option key={2} value=">">{"> x"}</option>
                <option key={3} value="<">{"< x"}</option>
                <option key={4} value=">=">{">= x"}</option>
                <option key={5} value="<=">{"<= x"}</option>
            </select>
                return <div>
                    { comparerSelector }
                    <label htmlFor="dateselect">Select Date:</label>
                    <input style={{color:'white'}} type="date" id="dateselect" min="1900-01-01" onChange={e=>this.setState({valueSelected: e.target.value})}></input>
                    </div> 
            }

            if (input === "options") {
                let optionSelections = []
                values.forEach((val,index) => {
                    optionSelections.push(<option key={index} value={val}>{val}</option>)
                })

                return <div>
                    <select style={{...selectStyle}} className="browser-default" onChange={e=>this.setState({valueSelected:e.target.value})}>
                    <option value="">Select Value:</option>
                    { optionSelections }
                    </select>
                </div>
            }

            if (input === "text_field") {
                let comparerSelector = null
                if (min || max) { // include > = < options
                    comparerSelector = <select style={{...selectStyle}} className="browser-default" onChange={e=>this.setState({valueComparer:e.target.value})}>
                        <option key={0} value="=">Select Comparison:</option>
                        <option key={1} value="=">{"= x"}</option>
                        <option key={2} value=">">{"> x"}</option>
                        <option key={3} value="<">{"< x"}</option>
                        <option key={4} value=">=">{">= x"}</option>
                        <option key={5} value="<=">{"<= x"}</option>
                    </select>
                }
                return <div>
                    { comparerSelector }
                    <label htmlFor="inputval">x:</label>
                    <input id="inputval" onChange={e=>this.setState({valueSelected:e.target.value})} style={{color:'#ff8'}} defaultValue={0} type="text"></input>
                    { this.state.columnSelected }
                    { this.state.valueSelected }
                    { this.state.valueComparer }
                </div>
            }
        }

        return <div style={{color:'white'}}>
            { selectColumn() }
            { inputValue() }
            { !this.state.valueSelected ? null : <button onClick={()=>this.createNode(table,x,y)} style={{...buttonAddNode}}>Add Node</button> }
        </div>
    }
}

const mapStateToProps = state => ({
    dbTablesMeta: state.dbTablesMeta,
    nodes: state.nodes
})

export default connect(mapStateToProps)(FilterForm2)

const {buttonDelete,buttonAddNode,selectStyle} = arenastyle
