/*  unchanging vs changing per db
    nodeTypes, columns
    styles / styleType="table"
    calculations(?).. how much complexity in here
    server.models <-> dataspec (future work: read models->create (parts of) dataspec)
    when you want to add stuff, should only have to change dataspec as much as possible
    nodestate: {
        inputs: "filled" | "unfilled" | "incorrect type"
    }
*/

/*  HOW-TOs

    AutoConnect fromNode to toNode.key on rt-clk:
        func.toNode_func.inputPerParentType.key = fromNode_func

*/

export default {
    tablesForCalcs: ["policies_small","policies","mort_ms","mort_mn","mor_fs","mort_fn"],
    allColumns: ["dob","dop","gender","smokingstatus","faceamount","age","px","qx"],
    columnInputs: { // see FilterForm2 for use
        dob: {          input: "date_picker",   values: false,                  min: false, max: false },
        dop: {          input: "date_picker",   values: false,                  min: false, max: false },
        gender: {       input: "options",       values: ["male","female"],      min: false, max: false },
        smokingstatus: {input: "options",       values: ["Smoker","Non-Smoker"],min: false, max: false },
        faceamount: {   input: "text_field",    values: false, min: 10000,  max: 1000000 },
        x: {            input: "text_field",    values: false, min: 1,      max: 110 },
        age: {          input: "text_field",    values: false, min: 1,      max: 110 },
        px: {           input: "text_field",    values: false, min: 0,      max: 1 },
        qx: {           input: "text_field",    values: false, min: 0,      max: 1 }
    },
    func: {
        getDBTable: {
            inputs: {table:""},
            inputPerParentType: {},
            styleType: "table",
            derivNodes: ["columnVector","filterTable","extensionTable"]
        },
        filterTable: {
            inputs: {parentTable:"table",column:"column", comparer:"array", value:"any"},
            inputPerParentType: {},
            styleType: "table",
            derivNodes: ["columnVector","filterTable","extensionTable"]
        },
        extensionTable: {
            inputs: {parentTable:"",calcColumns:{}},
            inputPerParentType: {columnCalc:"expressionBank"},
            styleType: "table",
            derivNodes: ["columnVector","filterTable","extensionTable"]
        },
        tableVector: {
            inputs: {table:"table",column:"column"},
            inputPerParentType: {},
            styleType: "tableVector",
            derivNodes: ["sumVector"]
        },
        sumVector: {
            inputs: {table:"",column:""},
            inputPerParentType: {tableVector: "vector"},
            styleType: "reduce",
            derivNodes: ["map"]
        },
        columnCalc: {
            inputs: { columnName:"", columnCalc:{}, prevCalcs:[] },
            inputPerParentType: {columnCalc:"parentCalcNode"},
            // columnCalc: { name:"age", calc: ["round",["div",["add","presentDate","-dob"],365],0] }
            styleType: "",
            derivNodes: ["calcColumn"]
        }
    },
    nodeInputs: {
        conditionTypes: {
            faceamount: ["= x","> x","< x"], // pick type, enter value
            gender: ["male","female"], // pick value
            smokingstatus: ["Smoker","Non-Smoker"], // pick value
            dob: ["date"], // pick date
            dop: ["date"] // pick date
        },
        conditionRequiresInput: {
            faceamount: true,
            gender: false,
            smokingstatus: false,
            dob: true,
            dop: true
        },
        ignoreColumns: ["createdAt","updatedAt","id","policynumber","name"]
    },
    style: {
        button: {
            getDBTable: {},
            deleteNode: {},
            cancel: {}
        },
        node: {
            getDBTable: {
                size: { width: 100, height: 30 },
                attrs: { rect: { fill: {
                    type: 'linearGradient', 
                    stops: [{offset: '0%',  color: '#014', opacity: 0.7},
                            {offset:'50%',  color: '#018', opacity: 0.7},
                            {offset:'100%', color: '#014', opacity: 0.7}]},
                            stroke: '#44b',
                            strokeWidth: 2,
                        rx: 4, ry: 4 },
                        text: { fill: 'white', fontSize: 15, fontFamily:'calibri', /*fontWeight: 'bold'*/},
                    }
            },
            filterTable: {
                size: { width: 100, height: 30 },
                attrs: { rect: { fill: {
                    type: 'linearGradient', stops: [{offset: '0%', color: '#008'},
                                                    {offset:'35%', color: '#244'},
                                                    {offset:'65%', color: '#244'},
                                                    {offset:'100%', color: '#008'}],
                    attrs: {x1: '0%', y1: '0%', x2: '0%', y2: '100%'}
                    },
                    rx: 4, ry: 4 },
                    text: {fill: 'white', fontSize: 10} }
            },
            extensionTable: {
                size: { width: 120, height: 30 },
                attrs: { rect: { fill: {
                    type: 'linearGradient', 
                    stops: [{offset: '0%',  color: '#033', opacity: 0.8},
                            //{offset:'50%',  color: '#055', opacity: 0.8},
                            {offset:'81%', color: '#033', opacity: 0.8},
                            {offset:'83%', color: '#002', opacity: 0.8},
                            {offset:'85%', color: '#008', opacity: 0.8},
                            {offset:'92%', color: '#008', opacity: 0.8},
                            {offset:'93%', color: '#048', opacity: 0.8}]},
                            //stroke: '#266',
                            //strokeWidth: 2,
                        rx: 4, ry: 4 },
                        text: {fontFamily:'calibri', fontSize: 15, fill: 'white'} }
            },
            tableVector: {
                size: { width: 100, height: 30 },
                attrs: { rect: { fill: {
                    type: 'linearGradient', 
                    stops: [{offset: '8%', color: '#008'},
                            {offset:'10%', color: '#002'},
                            {offset:'15%', color: '#044'},
                            {offset:'85%', color: '#044'},
                            {offset:'90%', color: '#002'},
                            {offset:'92%', color: '#048'}]
                    },
                    stroke: '#4a4', // (inputs filled | input type incorrect | inputs not filled)
                    // stroke: '#bbb', // '#2a2', '#bb0', '#8cc'
                    strokeWidth: 3,
                        rx: 4, ry: 4 },
                        text: {fill: 'white'} }
            },
            sumVector: {
                size: { width: 100, height: 30 },
                attrs: { rect: { fill: {
                    type: 'linearGradient', 
                    stops: [{offset: '8%', color: '#008'},
                            {offset:'10%', color: '#002'},
                            {offset:'15%', color: '#048'},
                            {offset:'85%', color: '#282'},
                            {offset:'90%', color: '#002'},
                            {offset:'92%', color: '#080'}]
                    },
                        rx: 4, ry: 4 },
                        text: {fill: 'white'} }
            },
            columnCalc: {
                size: { width: 110, height: 20 },
                attrs: { rect: { fill: {
                    type: 'linearGradient', 
                    stops: [{offset: '5%', color: '#008'},
                            {offset:'8%', color: '#002'},
                            {offset:'10%', color: '#044'},
                            {offset:'90%', color: '#044'},
                            {offset:'92%', color: '#002'},
                            {offset:'95%', color: '#06a'}]
                    },
                        rx: 4, ry: 4 },
                        text: {fill: 'white', fontFamily: 'calibri', size: 18, fontWeight: 'normal'} }
            }
        },
        menu: {
            arenaDefault: {}
        }
    }
}

const style1 = {
    size: { width: 100, height: 30 },
    attrs: { rect: { fill: {
        type: 'linearGradient', 
        stops: [{offset: '8%', color: '#008'},
                {offset:'10%', color: '#002'},
                {offset:'15%', color: '#044'},
                {offset:'85%', color: '#044'},
                {offset:'90%', color: '#002'},
                {offset:'92%', color: '#008'}]
        },
            rx: 4, ry: 4 },
            text: {fill: 'white'} }
}

const style2 = {
    size: { width: 100, height: 30 },
    attrs: { rect: { fill: {
        type: 'linearGradient', 
        stops: [{offset: '8%', color: '#008'},
                {offset:'10%', color: '#002'},
                {offset:'15%', color: '#048'},
                {offset:'85%', color: '#282'},
                {offset:'90%', color: '#002'},
                {offset:'92%', color: '#080'}]
        },
            rx: 4, ry: 4 },
            text: {fill: 'white'} }
}


/*
style={getStyle(ds.func["getDBTable"].styleType)}

let { type, min, max } = ds.column["faceamount"]
let { type, values } = ds.column["smokingstatus"]


ds.func["extendTable"]

think -> dataspec -> code
dataspec is like making lists in excel from which you start making tables/calcs
*/