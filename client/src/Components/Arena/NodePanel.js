import React, { Component } from 'react'

class NodePanel extends Component {
    render() {
        console.log('this.props.nodeResults: ',this.props.nodeResults)
        const {nodeResults,nodeFunc} = this.props
        console.log('nodeFunc: ',nodeFunc)

        const dataTable = () => {
            // header, header-listeners, cell-listeners
            const dataHeaders = Object.keys(this.props.nodeResults[0])
            const dataRows = this.props.nodeResults

            const tableHeader = <tr>{ dataHeaders.map((str,index) => <th key={index} style={thStyle}>{str}</th>) }</tr>
            const tableRows = dataRows.map((row,index) => <tr key={index}>
                { Object.keys(row).map((key,index2) => <td key={index2} style={tdStyle}>{row[key]}</td>) }
            </tr>)

            return <table><tbody>{tableHeader}{tableRows}</tbody></table>
        }

        const dataVector = () => {
            const dataHeader = Object.keys(this.props.nodeResults)[0]
            const tableHeader = <tr><th style={thStyle}>{Object.keys(this.props.nodeResults)[0]}</th></tr>
            const dataRows = this.props.nodeResults[dataHeader]
            const tableRows = dataRows.map((num,index) => <tr key={index}><td style={tdStyle}>{num}</td></tr>)

            return <table><tbody>{tableHeader}{tableRows}</tbody></table>
        }

        const dataNum = () => {
            const dataHeader = Object.keys(this.props.nodeResults)[0]
            const dataAmount = this.props.nodeResults[dataHeader]
            return <table><tbody>
                <tr><th style={thStyle}>{dataHeader}</th></tr>
                <tr><td style={tdStyle}>{dataAmount}</td></tr>
            </tbody></table>
        }

        const dataExpression = () => {
            const {column,expression} = this.props.nodeResults
            
            return <table><tbody>
                <tr><th style={thStyle}>{column}</th></tr>
                <tr><td style={tdStyle}>{expression}</td></tr>
            </tbody></table>
        }

        const display = nodeFunc==="getDBTable"||nodeFunc==="filterTable"||nodeFunc==="extensionTable"
                            ? dataTable() :
                        nodeFunc==="tableVector"
                            ? dataVector() :
                        nodeFunc==="sumVector"
                            ? dataNum() :
                        nodeFunc==="columnCalc"
                            ? dataExpression() :
                        <div>{`Unknown func "${nodeFunc}"`}</div>

        return <div style={style}>{display}</div>
    }
}

export default NodePanel

const style = {
    backgroundColor: '#484'
}

const thStyle = {
    border: 'solid',
    borderWidth: '1px',
    color: '#ffc',
    backgroundColor: '#223',
    fontSize: 12
}

const tdStyle = {
    border: 'solid',
    borderWidth: '1px',
    backgroundColor: '#aaf',
    fontSize: 12
}