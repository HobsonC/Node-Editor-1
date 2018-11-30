import React, { Component } from 'react'
import { connect } from 'react-redux'

const calcStyle = {
    width: 'auto',
    color: '#39ff14',
    backgroundColor: '#000',
    display: 'inline-block'
}

class Calc extends Component {
    render() {
        const displayObj = obj => {
            const keyValuePairs = Object.keys(obj).map(key => {
                return `${key}: ${obj[key]}`
            }).join(',')
            return `{${keyValuePairs}}`
        }

        const listInputs = inputs => {
            let inputList = []
            let index = 0
            Object.keys(inputs).forEach(key => {
                let displayInput = typeof inputs[key] !== "object" ? inputs[key] : displayObj(inputs[key])
                inputList.push(<li key={index++}><b>{key}</b>: {displayInput}</li>)
            })

            return <div><ul>{inputList}</ul></div>
        }

        const nodeList = () => {
            let funcList = []
            let inputList = []
            let nodeRows = []
            let index = 0
            this.props.calcTable.forEach(node => {
                funcList.push(<li key={index++}>{node.func}</li>)
                inputList.push(<li key={index++}>{node.inputs[0]}</li>)
                nodeRows.push(<tr key={index++} style={trStyle}>
                        <td style={{...tdStyle,color:"#ddd"}}>{node.id.replace("node_","")}</td>
                        <td style={{...tdStyle,color:"#aaf"}}>{node.func}</td>
                        <td style={tdStyle}>{listInputs(node.inputs)}</td>
                    </tr>)
            })
            return <table style={tableStyle}>
                    <tbody>
                        <tr key={index++}>
                            <th style={{...thStyle, color:"#ddd"}}>ID</th>
                            <th style={{...thStyle, color:"#55f"}}>Function</th>
                            <th style={{...thStyle, color:"#4f4"}}>Inputs</th>
                        </tr>
                        { nodeRows }
                    </tbody>
                </table>

        }

        return <div style={calcStyle}>
            { nodeList() }
        </div>
    }
}

const mapStateToProps = state => ({
    calcTable: state.calcTable
})

export default connect(mapStateToProps)(Calc)


const tableStyle = {
    width: "100%",
    border: '1px solid #044',
    borderCollapse: 'collapse',
    paddingTop: '0px',
    paddingBottom: '0px'
}

const trStyle = {
    paddingTop: '0px',
    paddingBottom: '0px'
}

const thStyle = {
    color:"#88f",
}

const tdStyle = {
    color:"#8f8",
    border: '1px solid #044',
    borderCollapse: 'collapse',
    paddingTop: '0px',
    paddingBottom: '0px'
}

