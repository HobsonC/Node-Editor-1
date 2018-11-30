/*  unchanging vs changing per db
    nodeTypes, columns
    styles / styleType="table"
    calculations(?).. how much complexity in here
    server.models <-> dataspec (future work: read models->create (parts of) dataspec)
*/

export default {
    column: {
        id: { type: "integer", min: 1 },
        policynumber: { type: "integer", min: 1 },
        name: { type: "text" },
        dob: { type: "date" },
        dop: { type: "date" },
        gender: { type: "text", values: ["male","female"] },
        smokingstatus: { type: "text", values: ["Smoker","Non-Smoker"] },
        faceamount: { type: "integer", min: 10000, max: 1000000 },
        x: { type: "integer" },
        age: { type: "integer" },
        px: { type: "real", min: 0, max: 1 },
        qx: { type: "real", min: 0, max: 1 }
    },
    func: {
        getDBTable: {
            inputs: {table:""},
            styleType: "table",
            derivNodes: ["columnVector","filterTable","extendTable"]
        },
        filterTable: {
            inputs: {parentTable:"",columns:[]},
            styleType: "table",
            derivNodes: ["columnVector","filterTable","extendTable"]
        },
        extendTable: {
            inputs: {parentTable:"",calcColumns:{}},
            styleType: "table",
            derivNodes: ["columnVector","filterTable","extendTable"]
        },
        sumVector: {
            inputs: {table:"",column:""},
            styleType: "reduce",
            derivNodes: ["map"]
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
            getDBTable: {}
        },
        menu: {
            arenaDefault: {}
        }
    }
}


/*
style={getStyle(ds.func["getDBTable"].styleType)}

let { type, min, max } = ds.column["faceamount"]
let { type, values } = ds.column["smokingstatus"]


ds.func["extendTable"]

think -> dataspec -> code
dataspec is like making lists in excel from which you start making tables/calcs
*/