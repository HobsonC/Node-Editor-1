import React, { Component } from 'react'
import Graph from '../Components/Arena/Graph'
import CalcTable from './CalcTable'
import NodePanel from './Arena/NodePanel'
import { connect } from 'react-redux'
/// node results should appear in a panel

class Main extends Component {

    render() {
        let activeNodeResults = this.props.nodeResults[this.props.activeNodeID] || false
        let activeNodeFunc = activeNodeResults ? this.props.nodes[this.props.activeNodeID].func : ""

        return <div style={mainStyle}>
            <Graph style={graphStyle} />
            {this.props.devMode ? <CalcTable style={calcStyle} /> : null}
            { activeNodeResults ? <NodePanel style={panelStyle} nodeFunc={activeNodeFunc} nodeResults={activeNodeResults} /> : null }
        </div>
    }
}

const mapStateToProps = state => ({
    devMode: state.devMode,
    activeNodeID: state.activeNodeID,
    nodeResults: state.nodeResults,
    nodes: state.nodes
})

export default connect(mapStateToProps)(Main)

const mainStyle = {
    display: 'grid',
    gridTemplateColumns: '3fr 1fr',
    gridTemplateRows: '300px 300px',
    columnGap: '0px',
    rowGap: '0px'
}

const graphStyle = {
    gridColumnStart: 1,
    gridColumnEnd: 3,
    gridRowStart: 1,
    gridRowEnd: 2
}

const calcStyle = {
    justifySelf: 'left',
    gridColumnStart: 3,
    gridColumnEnd: 4,
    gridRowStart: 1,
    gridRowEnd: 2
}

const panelStyle = {
    gridColumnStart: 1,
    gridColumnEnd: 4,
    gridRowStart: 2,
    gridRowEnd: 3
}