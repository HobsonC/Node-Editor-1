import React, { Component } from 'react'
import ui from '../../style/ui'

class NodeInfoBox extends Component {
    constructor(props) {
        super(props)
        let {nodeInfo={}} = props
        this.state = {
            nodeInfo,
            idNames: nodeInfo.idNames,
            height: 0
        }
    }

    componentDidMount() {
        // get height of box
        if (this.divElement) this.setState({height:this.divElement.clientHeight})
    }

    render() {
        const {x,y,name,func,inputs} = this.state.nodeInfo

        const objDisplay = obj => {
            return Object.keys(obj).map((k,i) => <div key={i} style={{color:'#aaf'}}><b style={{color:'#111'}}>.......</b>{`${k}: `} <b style={{color:'#4bb'}}>{typeof obj[k]==='object'?`{...}`:obj[k]}</b></div>)
        }

        const inputsDisplay = obj => {
            if (typeof obj !== 'object') return "obj"
            const keyValueList = Object.keys(obj).map((k,i) => <div key={i}>{`${k}:`} {typeof obj[k] === 'object'?objDisplay(obj[k]):<b style={{color:'#4bb'}}>{obj[k].startsWith('node_')?this.state.idNames[obj[k]]:obj[k]}</b>}</div>)
            return keyValueList
        }

        // position
        let top = y-this.state.height - 5
        if (top < 0) top = 0
        let left = top > 0 ? x : x+100

        return <div ref={(divElement) => this.divElement = divElement} style={ui.form({type:'infoBox',left,top,marginTop:'0px',width:'flex'})}>
        <p style={{height:'8px',marginTop:'0px'}}><b style={{color:'#dd0'}}>{func}</b></p>
        <div>{inputsDisplay(inputs)}</div>
        </div>
    }
}

export default NodeInfoBox
