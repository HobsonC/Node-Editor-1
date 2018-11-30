import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { Query, Mutation, graphql } from 'react-apollo'
import gql from 'graphql-tag'
import NodeSelector from './NodeSelector'
import ActiveNodeOptions from './ActiveNodeOptions'
import SaveArenaForm from './SaveArenaForm'
import NodeInfoBox from './NodeInfoBox'
import db from  '../../db_queries'
import dbm from '../../db_mutations'
import ds from '../../dataspec2'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as Actions from '../../store/actions'

import joint, { util } from 'jointjs'
import paperStyles from './paper_style'
import arenastyle from './arenastyle'
import ui from '../../style/ui'

class Graph extends Component {
    constructor(props) {
        super(props)
        const { dispatch } = props
        this.actions = bindActionCreators(Actions,dispatch)
        this.graph = new joint.dia.Graph()
        this.elID_nodeID = new Map()
        this.state = {
            prevActiveNodeID: "",
            nodeSelectorX: 0,
            nodeSelectorY: 0,
            activeNodeOptionsX: 0,
            activeNodeOptionsY: 0,
            inputSelectorOn: false,
            inputsSelection: [],
            currentFromNode: "",
            currentToNode: "",
            currentTableNames: [],
            calcTableStatus: "unsent",
            showResults: false,
            saveArena: false,
            saveArenaForm: false,
            getArena: false,
            getArenaName: false,
            arenaName: "",
            scaleFactor: 1,
            showInfoBox: false,
            infoBoxProps: {},
            nodeHovered: false
            // skipRerender: false  // Graph keeps rerendering, possibly bc of listeners
        }
    }

    getIDNames() {
        let idNames = {}
        Object.keys(this.props.nodes).forEach(nodeID => {
            idNames[nodeID] = this.props.nodes[nodeID].name
        })
        return idNames
    }

    componentDidMount() {
        const paper = new joint.dia.Paper({
            el: ReactDOM.findDOMNode(this.refs.placeholder),
            model: this.graph,
            ...paperStyles.default
        })

        // set paper width if devMode === false
        if (!this.props.devMode) paper.setDimensions(window.innerWidth,300)

        // Mousewheel behaviour.. on hold for now
        //paper.scale(this.state.scaleFactor,this.state.scaleFactor) // use this in a scroll-wheel event
        // paper.on('blank:mousewheel',(evt,x,y,delta) => {})
        // cell,link,element:mousewheel events also possible
        /*paper.on('blank:mousewheel',(evt,x,y,delta) => {
            console.log('evt: ',evt)
            console.log(`(x,y): (${x},${y})`)
            console.log('delta: ',delta)
            const newScaleFactor = delta===1?this.state.scaleFactor*1.05:this.state.scaleFactor/1.05
            this.setState({scaleFactor:newScaleFactor})
            paper.scale(newScaleFactor,newScaleFactor)
        })*/

        // Eventually want click-drag grouping/selection
        // Once multiselection there, many things possible:
        // move-all, copy-all, save-as-supernode, ...

        // Left-click paper
        paper.on('blank:pointerclick', (evt,x,y) => {
            if (this.props.activeNodeID) {
                /// click-drag
                // reducer: clickDragStartXY=[x,y]
                // clickDragActive = true
                // clickDragEndXY=[x,y], updates continuously so user can see box changing
                // findSelectedNodes(x1,y1,x2,y2), updates continously "  "
                // selectedNodes=["node_1","node_4"]
                // clickDragActive = false

                this.actions.nodeSelectorOff()
                this.actions.activeNodeOptionsOff()
                this.actions.setActiveNode("")
                this.setState({currentFromNode:"",currentToNode:"",getArenaForm:false,saveArenaForm:false,getArenaName:false})
            } else {
                this.actions.nodeSelectorOff()
                this.actions.activeNodeOptionsOff()
                this.actions.setActiveNode("")
                this.setState({currentFromNode:"",currentToNode:"",getArenaForm:false,saveArenaForm:false,getArenaName:false,showInfoBox:false})
            }
        })

        // Right-click paper
        paper.on('blank:contextmenu', (evt,x,y) => {
            this.actions.activeNodeOptionsOff()
            this.setState({currentFromNode:"",currentToNode:"",getArenaForm:false,saveArenaForm:false})
            this.setState({nodeSelectorX:x,nodeSelectorY:y})
            this.actions.nodeSelectorOn()

            if (this.props.activeNodeID !== "") {
                // newNode.inputs[selectedInput] = this.props.activeNodeID
                
            }
        })

        // Hover over node
        paper.on('element:mouseenter',(cellView,evt) => {
            if (this.state.showInfoBox) return // ow it will keep re-rendering info box
            else {
                const nodeID = this.elID_nodeID.get(cellView.model.id)
                this.setState({infoBoxProps:{...this.props.nodes[nodeID],idNames:this.getIDNames()},showInfoBox:true})
            }
        })

        paper.on('element:mouseleave',(cellView,evt) => { // mouseout keeps retriggering even if mouse doesn't leave node
            this.setState({infoBoxProps:{},showInfoBox:false})
        })

        paper.on('link:mouseenter',(cellView,evt) => {
            this.setState({infoBoxProps:{},showInfoBox:false})
        })

        // Left-click element (use pointerup instead, below)
        paper.on('element:pointerclick', (evt,x,y) => {})

        // Right-click element (activeNodeOptions OR createLink)
        paper.on('element:contextmenu', (el,evt,x,y) => {///
            this.actions.nodeSelectorOff()
            this.actions.activeNodeOptionsOff()
            let { activeNodeID } = this.props
            let altX = el.model.attributes.position.x
            let altY = el.model.attributes.position.y
            let nodeID = this.elID_nodeID.get(el.model.id)

            if (activeNodeID === "" || activeNodeID === nodeID) {
                //console.log('Open ACTIVE NODE OPTIONS')
                this.actions.setActiveNode(nodeID)
                let h = el.model.attributes.size.height
                this.setState({activeNodeOptionsX:altX,activeNodeOptionsY:altY+h+5})
                this.actions.activeNodeOptionsOn()
            } else { // Active node: create link
                //console.log('CREATE LINK')
                let inputKeys = Object.keys(this.props.nodes[nodeID].inputs)
                this.setState({ currentFromNode:activeNodeID,
                                currentToNode:nodeID,
                                inputsSelection:inputKeys,
                                inputSelectorOn:true})
                
                //this.actions.addLink(activeNodeID,nodeID,"abc")
            }
        })

        // Unclick element (what happens after you click on a node)
        paper.on('element:pointerup',(cellView,evt,x,y) => {
            this.actions.nodeSelectorOff()
            this.actions.activeNodeOptionsOff()
            const nodeID = this.elID_nodeID.get(cellView.model.id)
            this.setState({prevActiveNodeID:this.props.activeNodeID})
            this.actions.setActiveNode(nodeID)
            
        })

        this.actions.updateCalcTable() // here and add/remove Node/Link
    }

    populateArena() {
        // Reset graph
        this.graph.clear()
        if (!this.props.nodes) return

        let nodeRefs = new Map()

        // Nodes
        Object.keys(this.props.nodes).forEach(nodeID => {
            let {name,func,x,y} = this.props.nodes[nodeID]
            
            let rec = new joint.shapes.basic.Rect({
                position: {x,y},
                ...ds.style.node[func] // .data
            })
            
            if (func==="filterTable") {
                const nameParts = name.split(' ')
                rec.attr('text/text',`${nameParts[0]} \n ${nameParts[1]} \n ${nameParts[2]}`)
            }
            if (func==="extensionTable") {
                rec.attr('text/text', "Extend")
            } else {
                rec.attr('text/text',name)
            }

            rec.attr({label:{fontSize:32}})

            // put this in nodeStyles and use in above loop
            if (nodeID === this.props.activeNodeID) {
                rec.attr('rect/stroke-width',3)
                rec.attr('rect/stroke','#ff8')
            }

            rec.on('change:position',(el,pos) => {
                let { x, y } = pos
                this.actions.changeNodePosition(nodeID,x,y)
            })

            rec.addTo(this.graph)
            nodeRefs.set(nodeID,rec)
            this.elID_nodeID.set(rec.id,nodeID)
        })
        

        // Links
        this.props.nodeDependencies.forEach((nodeDeps,nodeID) => {
            nodeDeps.forEach(nodeDep => {
                let l = new joint.shapes.standard.Link({
                    router: { name: 'manhattan'},    // manhattan  metro  normal  orthogonal  oneSide
                    connector: { name: 'rounded'}, // rounded  jumpover  normal  smooth
                    attrs: {
                        line: {
                            targetMarker: {
                                'fill': '#888',
                                'stroke': 'none',
                                'd': 'M 8 -4 L 0 0 L 8 4 Z'
                            }
                        }
                    }
                })
                // 'd': 'M 5 -10 L -15 0 L 5 10 Z'
                // 'd': 'M 0 - 5 L -10 0 L 0  5 Z'
                //        -5  +5    +5    -5 -5
                l.source(nodeRefs.get(nodeDep))
                l.target(nodeRefs.get(nodeID))
                l.addTo(this.graph)
            })
        })
    }

    render() {
        this.populateArena()

        const mainButtonsX = this.props.devMode?innerWidth/2+230:innerWidth-120

        // GET DB TABLE METATDATA (NAMES + COLUMN NAMES/TYPES)
        const getTableInfos = tableNames => <Query query={db.tablesInfo(tableNames)}>
        {({loading,error,data}) => {
            if (loading) return <div>Loading Table Info...</div>
            if (error) return <div>Error Loading Table Info</div>

            let tablesInfoArray = []
            // make buttons
            data.tablesInfo.forEach(tableInfo => {
                let { name, columns } = tableInfo
                tablesInfoArray.push({name,columns})
            })
            this.actions.updateDBTablesMeta(tablesInfoArray)
            return null
        }}</Query>

        const allTableNames = () => <Query query={db.allTableNames()}>
        {({loading,error,data}) => {
            if (loading) return <div>Loading...</div>
            if (error) return <div>Error Loading</div>
            let tableNames = []
            let index = 0
            //data.allTableNames
            return getTableInfos(data.allTableNames)
        }}</Query>
        // =======================================================

        const inputSelector = () => {
            let inputButtonsList = []
            let { currentFromNode, currentToNode, inputsSelection } = this.state
            let index = 0

            // AUTO-CONNECT IF POSSIBLE
            let toProps// = this.props.nodes[currentToNode]
            let fromProps// = this.props.nodes[currentFromNode]
            if (!currentToNode || !currentFromNode) {
                return null
            }
            toProps = this.props.nodes[currentToNode]
            fromProps = this.props.nodes[currentFromNode]

            const inputKeyName = ds.func[toProps.func].inputPerParentType[fromProps.func]
            if (inputKeyName) {
                this.actions.addLink(currentFromNode,currentToNode,inputKeyName)
                this.actions.updateCalcTable()
                this.setState({inputSelectorOn:false,currentFromNode:"",currentToNode:"",inputsSelection:[]})
                return null
            }

            // ..ELSE MENU-CONNECT
            inputsSelection.forEach(inputKey => {
                inputButtonsList.push(<button key={index++} onClick={()=>{
                    this.actions.addLink(currentFromNode,currentToNode,inputKey)
                    this.actions.updateCalcTable()
                    this.setState({inputSelectorOn:false,currentFromNode:"",currentToNode:"",inputsSelection:[]})
                }} style={ui.button({type:"select"})}>{inputKey}</button>)
            })
            return  <div style={ui.form({})}>
                        <p>Node input:</p>
                        { inputButtonsList }
                        <button onClick={()=>{this.setState({inputSelectorOn:false})}} style={ui.button({type:"negate"})}>Cancel</button>
                    </div>
        }

        const calcTableButton = () => {
            // get calcTable and send to server
            let label = "Get Results" // View Results

            return <button style={ui.button({size:'small',type:'standard',position:'absolute',backgroundColor:'#224',left:mainButtonsX,top:5,height:'25px'})} onClick={()=>{
                this.setState({showResults:true})
            }}>{ label }</button>
        }

        const getCalcResults = () => {
            return <Query query={db.calcResultsTable(this.props.calcTable)}>
            {({loading,error,data})=>{
                if (error) return <div>Error getting results</div>
                if (loading) return <div>Loading results...</div>
                this.actions.updateResults(data.calcResultsTable)
                return null
            }}
            </Query>
        }

        const saveArenaButton = () => {
            // save reducer.nodes to db.Arenas
            return <button style={ui.button({size:'small',type:'standard',backgroundColor:'#242',position:'absolute',left:mainButtonsX,top:35,height:'25px'})} onClick={()=>{
                    this.setState({saveArenaForm:true,getArenaName:false})
                }}
            >Save Arena</button>
        }

        const saveArenaForm = () => {
            return <div style={ui.form({position:'absolute',left:innerWidth/2,top:50})}>
                        <p>Arena Name:</p>
                        <input style={{color:'white'}} type="text" id="arena_name" onChange={e=>this.setState({arenaName:e.target.value})}></input>
                        <button style={ui.button({type:"affirm"})} onClick={()=>this.setState({saveArena:true,saveArenaForm:false,getArenaName:false})}>Save Arena</button>
                        <button style={ui.button({type:"negate"})} onClick={()=>this.setState({saveArenaForm:false})}>Cancel</button>
            </div>
        }

        const saveArena = () => {
            console.log('saveArena ',this.state.arenaName)
            console.log('Saving arena ',this.state.arenaName)
            return <Mutation mutation={dbm.saveArena(this.state.arenaName,this.props.nodes)}>
            {(addArena,{loading,error,data}) => {
                if (error) {
                    console.log('error: ',error)
                    return <div>Error saving arena</div>
                }
                if (loading) return <div>Saving arena...</div>
                
                return <div style={ui.form({position:'absolute',left:innerWidth/2,top:50})}>
                        <p>Confirm Arena Save</p>
                        <button style={ui.button({type:"affirm"})} onClick={() => {
                            addArena().then(a => console.log('a: ',a))
                            this.setState({saveArena:false})
                    }}>Confirm</button>
                    <button style={ui.button({type:"negate"})} onClick={()=>{
                            this.setState({saveArena:false})
                        }}>Cancel</button>
                    </div>
            }}
            </Mutation>
        }

        const getArenaButton = () => {
            return <button style={ui.button({size:'small',type:'standard',position:'absolute',left:mainButtonsX,top:65,height:'25px'})} onClick={()=>{
                this.setState({getArenaName:true,saveArenaForm:false})
            }}>Get Arena</button>
        }

        const getArenaList = () => {
            console.log('getArenaList')
            return <Query query={db.getArenaNames()}>
            {({loading,error,data}) => {
                if (error) return <div>Error loading arena names</div>
                if (loading) return <div>Loading arena names...</div>
                const arenaNames = data.allArenaNames
                console.log('arenaNames: ',arenaNames)
                const arenaButtons = []
                arenaNames.forEach((name,i) => {

                    arenaButtons.push(<button key={i} style={ui.button({size:"med",type:"selectGreen"})} onClick={()=>{
                        this.setState({arenaName:name,getArenaName:false,getArena:true})

                    }}>{name}</button>)
                })
                return <div style={ui.form({position:'absolute',left:innerWidth/2,top:50})}>
                        <p>Summon Arena:</p>
                        {arenaButtons}
                        <button style={ui.button({size:"med",type:"negate"})} onClick={()=>{
                            this.setState({getArenaName:false})
                        }}>Cancel</button>
                    </div>
            }}
            </Query>
        }

        const getArena = () => {
            console.log('getArena')
            return <Query query={db.getArena(this.state.arenaName)}>
            {({loading,error,data}) => {
                if (error) return <div>Error loading arena</div>
                if (loading) return <div>Loading arena...</div>
                const newNodes = data.getArena
                console.log('PRE')
                this.actions.setNodes(newNodes) /// this is giving a warning
                console.log('POST')
                this.actions.updateCalcTable()
                this.setState({getArena:false})
                return null
            }}
            </Query>
        }

        return <div style={{position: 'relative',width:innerWidth/2}}>
            <div style={{position:'absolute'}} ref="placeholder"><p>Arena loading...</p></div>
            {
                this.props.nodeSelectorOpen
                ? <NodeSelector top={this.state.nodeSelectorY} left={this.state.nodeSelectorX} /> : null
            }
            {
                this.props.activeNodeOptionsOpen
                ? <ActiveNodeOptions x={this.state.activeNodeOptionsX} y={this.state.activeNodeOptionsY} /> : null
            }
            { this.state.inputSelectorOn ? inputSelector() : null }
            { allTableNames() }
            { true ? calcTableButton()  : null }
            { true ? saveArenaButton()  : null }
            { true ? getArenaButton()   : null }
            { this.state.showResults    ? getCalcResults()  : null }
            { this.state.saveArenaForm  ? saveArenaForm()   : null }
            { this.state.saveArena      ? saveArena()       : null }
            { this.state.getArenaName   ? getArenaList()    : null }
            { this.state.getArena       ? getArena()        : null }
            { this.state.showInfoBox ? <NodeInfoBox nodeInfo={this.state.infoBoxProps} /> : null }
        </div>
    }
}

const mapStateToProps = state => ({
    nodeSelectorOpen: state.nodeSelectorOpen,
    activeNodeID: state.activeNodeID,
    activeNodeOptionsOpen: state.activeNodeOptionsOpen,
    nodes: state.nodes,
    nodeDependencies: state.nodeDependencies,
    calcTable: state.calcTable,
    devMode: state.devMode
})

export default connect(mapStateToProps)(Graph)
