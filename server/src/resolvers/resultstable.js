// An instance of resultstable should hold no data.. eventually remove
import { isArray } from 'util'
import globals from './globalwords'
import { getNested } from './mathtext2'

/*  ID  Func    Inputs    Precalc       Result
    0   f       [..]      true/false    _

Create calc table, list of needed row values
Calculate all precalc rows (globals,column funcs,etc) in calc table, save copy
Iterate data table rows
    iterate list of needed row values, get values saved in array
    iterate rows of calc table copy 1->n
        !precalc rows -> lookup or calculate
        copy results column of calc table to final-column array
*/

export default class resultstable {
    constructor({   nested=[], // some of this stuff should come from config file (if data specific)
                    columnfuncwords=["ccount","csum","ccountif","csumif"],
                    rowlookupwords=["faceamount","mprem","dob","dop"],
                    mathfuncwords=["+","-","*","/","^","max","min","yearsbetween"],
                }) {
        this.globalwords = globals.getAllGlobalWords()
        this.columnfuncwords = columnfuncwords
        this.rowlookupwords = rowlookupwords
        this.mathfuncwords = mathfuncwords
        this.results = new Map()
        this.resultsArchive = new Map() // cache results here
        this.currentID = 0
        this.currentRowValues = {}// {"faceamount":125000,"mprem":800}
        this.testCounter = 0
        this.newTable = true
        this.reductionFuncs = {
            ccount: (acc,cur) => acc + 1,
            ccountInit: 0,
            csum: (acc,cur) => acc + cur,
            csumInit: 0,
            cmax: (max,cur) => Math.max(max,cur),
            cmaxInit: 0
        }
    }

    getArchiveString() {
        let archiveString = "\nARCHIVESTRING ===================="
        let archiveKeys = this.resultsArchive.keys()
        this.resultsArchive.forEach(r => {
            archiveString += "\nColumn: " + archiveKeys.next().value + "\n"
            archiveString += this.getMapString(r)
        })
        archiveString += "===================================\n"
        return archiveString
    }

    getMapString(map) {
        let result = ""
        map.forEach((val,key) => {
            result += `${key}: {${Object.keys(val).map(k=>k+": "+val[k]).join(", ")}}\n`
        })
        return result
    }

    getObjString(obj) {
        let self = this
        if (typeof obj === "object")
            return '{' + Object.keys(obj).map(k => `${k}:${self.getObjString(obj[k])}`).join(',') + '}'
        else 
            return obj
    }

    resultsString() {
        let str = ""
        this.results.forEach((row) => {
            str += "["
            Object.keys(row).forEach(key => str += row[key] + '\t')
            
            str += "]\n\r"
        })
        return str
    }

    allAreNumbers(arr) {
        /// if el is a string and starts with id_ then lookup values
        let result = true
        arr.forEach(el => {if (typeof el !== "number") result=false})
        return result
    }

    addResultsMap(name,calcMap) {
        this.resultsArchive.set(name,calcMap)
    }

    getResultsMap(name) {
        return this.resultsArchive.get(name)
    }

    updateRow(newRow) {
        this.currentRowValues = newRow
        if (this.newTable) this.rowlookupwords = Object.keys(newRow)
        this.newTable = false
    }

    getCalcFromRow() {
        this.results.forEach((calcTableRow,key) => { // iterate thru calc table rows
            let {id,func,precalc,inputs,result} = calcTableRow
            this.results.set(key,{id,func,precalc,inputs,result:this.stringFunc(func,inputs)})
        })
        return this.results.get('id_'+this.results.size-1)
    }

    getNewID() { return 'id_'+this.currentID++ }
    getResultsTable() { return this.results }
    isPrecalc(id) { return this.results.get(id).precalc }
    allArePrecalc(ids) {
        let allPrecalc = true
        ids.forEach(id => !this.isPrecalc(id)?allPrecalc=false:{})
        return allPrecalc
    }

/*
    ID	Func 			Inputs 				PreCal		Result 
    0	getColumn 		[dob] 				false		'1955-02-22'
    1 	getConstant 	[present] 			true		'2018-08-22'
    2 	yearsbetween 	[result_0,result_1] false		63.5
*/
    applyToEachNestedTerm(struct,func) { 
        return isArray(struct)  ? struct.map(t => applyToEachNestedTerm(t,func))
                                : func(struct)
    }

    getStructType(word) { // word (atomic) => type of word
        let generalType = typeof word
        let structType = generalType
        if (generalType==="string") {
            structType = isArray(word)              ? "array"
            : (/^\d+$/g).test(word)                 ? "stringnumber"
            : (/^(true|false)$/g).test(word)        ? "stringboolean"
            : this.globalwords.includes(word)       ? "globalword"
            : this.columnfuncwords.includes(word)   ? "columnfuncword"
            : this.rowlookupwords.includes(word)    ? "rowlookupword"
            : this.mathfuncwords.includes(word)     ? "mathfuncword"
                                                    : "string"
        }
        return structType
    }
    
    wordIsPrecalc(word) {
        const structType = this.getStructType(word)
        return structType==="number"||structType==="stringnumber"||structType==="globalword"||structType==="columnfuncword"
    }

    mathFunc(op,args) {
        //console.log(`mathFunc(${op},${args})`)
        return   op==="+" ? args.reduce((acc,curr)=>acc+curr)
                :op==="-" ? args[0]-args[1]
                :op==="*" ? args.reduce((acc,curr)=>acc*curr)
                :op==="/" ? args[0]/args[1]
                :op==="^" ? args[0]^args[1]
                :op==="count" ? args.length
                :op==="max" ? Math.max(...args)
                :op==="min" ? Math.min(...args)
                :op==="yearsbetween" ? yearsbetween(args[0],args[1])
                :0
    }

    stringFunc(word,inputs=[],dataRow={},prevCalcs={}) {
        const structType = this.getStructType(word)
        if (structType==="number") return word
        if (structType==="stringnumber") return Number.parseFloat(word)
        if (structType==="boolean") return word
        if (structType==="stringboolean") return word.toUpperCase()==="TRUE"?true:false
        if (structType==="mathfuncword") return this.mathFunc(word,inputs) // this.allAreNumbers(inputs)?this.mathFunc(word,inputs):word
        if (structType==="rowlookupword") return dataRow[word]  //Object.keys(this.currentRowValues).includes(word)?this.currentRowValues[word]:0
        //if (structType==="columnfuncword") return 0 ///
        if (Object.keys(prevCalcs).includes(word)) return prevCalcs[word]
        return word
    }

    tableReduce(table,columnName,reduceFuncName) {          // [{_},{_},_] --> R
        console.log('\ntable: ',table)
        console.log('columnName: ',columnName)
        console.log('reduceFuncName: ',reduceFuncName)
        const reduceFunc = this.reductionFuncs[reduceFuncName]
        const reduceFuncInit = this.reductionFuncs[reduceFuncName+'Init']
        console.log('reduceFuncInit: ',reduceFuncInit)
        console.log('reduceFunc: ',reduceFunc)
        return table.map(jsonRow => jsonRow[columnName])    // [{_},{_},_] --> [m,n,_]
                    .reduce(reduceFunc,reduceFuncInit)                     // [m,n,_]     --> R
    }

    getTableFromNested(colname,struc) { // (colname,struc)
        this.results = new Map()
        this.convertNestedToTable(struc)
        this.currentID = 0
        this.resultsArchive.set(colname,this.results)
        return this.results
    }

    resetResultsArchive() {
        this.resultsArchive = new Map()
        return true
    }

    convertNestedToTable(struc,lowerIDs=[],precalcValues={}) { // [a,[b,c]] => table
        let newID = -1
        let self = this
        let inputs = [...lowerIDs]
        if (!isArray(struc)) { // Word______________________________________________________
            newID = this.getNewID()
            let wordType = this.getStructType(struc)
            this.results.set(newID,{id:newID,func:struc,precalc:this.wordIsPrecalc(wordType),inputs,result:this.stringFunc(struc,inputs)})
        }
        else { // Array_____0=func, 1+=args_________________________________________________
            let [func, ...args] = struc
            let argIDs = args.map(arg => self.convertNestedToTable(arg,[]))
            newID = this.getNewID()
            let argResults = argIDs.map(id => this.results.get(id).result)
            this.results.set(newID,{id:newID,func,precalc:false,inputs:argIDs,result:this.stringFunc(func,argResults)})
            // if all args are precalc then this is precalc
        }
    
        return newID
    }

    setResult(id,val) {
        this.results.set(id,val)
    }

    getResult(id) {
        return this.results.get(id)
    }

    extTable(expBank,parentTable) { // should calc whole row at a time (ie all expressions)
        const nestedBank = Object.keys(expBank).map(expName => getNested(expBank[expName]))
        const calcTables = nestedBank.map((nes,i) => {
            let result = this.getTableFromNested(Object.keys(expBank)[i],nes)
            return result
        })

        console.log('calcTables:')
        Object.keys(calcTables).forEach(k=>console.log(this.getMapString(calcTables[k])))

        /// find and collect column funcs (globals, etc later)
        const columnFuncs = []
        calcTables.forEach((calcTable,i) => {
            calcTable.forEach((calcRow,j) => {
                if (this.columnfuncwords.includes(calcRow.func)) {
                    let cfunc = calcRow.func
                    let cfuncInputIDs = calcRow.inputs // ids of columns /// want the column names..
                    console.log('calcTable: ',calcTable)
                    console.log('column: ',calcTable.get(cfuncInputIDs[0]).func)
                    let cfuncInputs = cfuncInputIDs.map(inputID => calcTable.get(inputID).func)

                    columnFuncs.push({calcTable:i,calcRow:j,cfunc,cfuncInputs})
                    // LATER: calcTables[i][j].result = applyCFunc(cfunc,...cfuncInputs)
                }
            })
        })

        // applyCFunc(cfunc,...inputs)

        columnFuncs.forEach(({calcTable,calcRow,cfunc,cfuncInputs},i) => {
            let reductionValue =  this.tableReduce(parentTable,cfuncInputs[0],cfunc)
            console.log('reductionValue: ',reductionValue)
            console.log('calcRow: ',calcRow)
            let newRow = Object.assign({},calcTables[calcTable].get(calcRow),{result: reductionValue, precalc: true}) 
            calcTables[calcTable].set(calcRow, newRow)
        })

        // Create extTable (= parent + calc columns)
        const extTable = []
        let calcColumns = {}
        Object.keys(expBank).forEach(k => calcColumns[k] = [])  
        parentTable.forEach((dataRow,i) => {
            let allRowCalcs = {}
            calcTables.forEach((calcTable,j) => { // row --> 
                let funcResult
                let calcColumnName = Object.keys(calcColumns)[j]
                calcTable.forEach((calcRow,k) => {
                    let {id,func,precalc,inputs,result} = calcRow

                    if (precalc && k<calcTable.length) return

                    if (this.getStructType(func) === "columnfuncword") {
                        console.log('aaa')
                        console.log('calcTables[j].get(k).result: ',calcTables[j].get(k).result)
                        funcResult = calcTables[j].get(k).result
                        return
                    }

                    let inputValues = inputs.map(input => {
                        if (typeof input==='string' && input.startsWith('id_'))
                            return calcTable.get(input).result
                        else return input
                    })
                    funcResult = this.stringFunc(func,inputValues,dataRow,allRowCalcs)
                    console.log(`funcResult=stringFunc(func=${func}) = ${funcResult}`)
                    calcTables[j].get(k).result =  funcResult
                }) // end of calcTable
                calcColumns[calcColumnName].push(funcResult) // remove
                allRowCalcs[calcColumnName] = funcResult

            }) // end of calcTables
            extTable.push(Object.assign({},dataRow,allRowCalcs))
        })
        return extTable
    }
}

// FUNCTIONS THAT WILL BE PUT IN THEIR OWN MODULE

function yearsbetween(date1,date2) {
    if (!date1 || !date2) return 0 // why
    let d1 = new Date(date1)
    let d2 = new Date(date2)
    const yearDiff = d2.getFullYear() - d1.getFullYear()
    const monthDiff = d2.getMonth() - d1.getMonth()
    const dayDiff = d2.getDay() - d1.getDay()
    const result = Math.round(yearDiff+(monthDiff/12)+(dayDiff/365))
    
    //console.log(`yearsbetween(${date1},${date2}) = ${result}`)
    return result
}