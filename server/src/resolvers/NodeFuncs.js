// calc heavy, sb python in future, or python layer in between this & pg
import { isArray, isString } from 'util'
import { getNested } from './mathtext'
import Resultstable from './resultstable'

export default class NodeFuncs {
    constructor(models,sequelize) {
        this.models = models
        this.seq = sequelize
        this.resultsMap = new Map() // id => result
        this.allFuncs = ["getDBTable","filterTable","tableVector","sumVector","extensionTable","columnCalc"]
        this.allColumnFuncs = ["columnsum","countif","sumif"]
        this.allRowFuncs = ["if","or","xor","yearsbetween"]
        this.date = new Date()
        this.date.presentYearMonthDay = [this.date.getFullYear(),this.date.getMonth(),this.date.getDate()]
        this.resultsTable = new Resultstable({})
    }

    getResultsMap() {
        return this.resultsMap
    }

    funcExists(tryFunc) {
        return this.allFuncs.includes(tryFunc)
    }

    printNestedArray(nested) {
        if (!isArray(nested)) return nested
        return "[" + nested.map(w => this.printNestedArray(w)).join(", ") + "]"
    }

    printObject(obj) {
        let self = this
        if (typeof obj !=='object') return obj
        else return Object.keys(obj).map(k => `${k}: ${self.printObject(obj[k])}`)
    }

    async func(id,funcName,inputs) {
        //console.log('funcName: ',funcName)
        //console.log('inputs: ',inputs)
        switch(funcName) {
            case "getDBTable":
            return await this.getDBTable(id,inputs)
                .then(()=>true)
                .catch(()=>false)

            case "filterTable":
            await this.filterTable(id,inputs)
            return true

            case "tableVector":
            await this.tableVector(id,inputs)
            return true

            case "sumVector":
            await this.sumVector(id,inputs)
            return true

            case "extensionTable":
            await this.extensionTable(id,inputs)
            return true

            case "columnCalc":
            await this.columnCalc(id,inputs)
            return true

            default:
            return {message:`Function "${funcName}" doesn't exist."`}
        }
    }

    async getDBTable(id,inputs) { // this is not waiting/being waited for
        const {table} = inputs
//        const result = await this.models.Table.getTable(table)
//        this.resultsMap.set(id, result)
        return new Promise((resolve,reject) => {
            this.models.Table.getTable(table).then(table=>{
                this.resultsMap.set(id,table)
                resolve(table)
            })
            .catch(err=>reject(err))
        })
    }

    lookupDBTable(name) {
        return this.models.Table.getTable(name)
    }

    async filterTable(id,inputs) {
        console.log('filterTable')
        const {parentTable,originalTable,column,comparer,value} = inputs
        const tableFrom = this.resultsMap.get(parentTable)
        const result = tableFrom.filter(row => this.applyComparer(comparer,row[column],value))
        if (result.length===0) result.push({})
        this.resultsMap.set(id,result)
        return await result
    }

    async tableVector(id,inputs) {
        console.log('tableVector')
        const {table,column} = inputs
        const tableFrom = this.resultsMap.get(table)
        const result = {}
        result[column] = tableFrom.map(row=>row[column])
        await this.resultsMap.set(id,result)
        return result
    }

    async sumVector(id,inputs) {
        const {vector} = inputs
        const vectorFrom = this.resultsMap.get(vector)
        const col = Object.keys(vectorFrom)[0]
        const result = {}
        result[col] = vectorFrom[col].reduce((accum,curr) => accum+curr)
        this.resultsMap.set(id,result)
        return await result
    }

    async columnCalc(id,inputs) {
        await this.resultsMap.set(id,inputs)
        return inputs.expressionBank
    }

    async extensionTable(id,inputs) {
        //console.log(`extensionTable(${id},${this.printObject(inputs)})`)
        const {parentTable,originalTable,expressionBank} = inputs
        const expBankResult = this.resultsMap.get(expressionBank).expressionBank
        const parentTableResult = this.resultsMap.get(parentTable)
        

        const extTable = this.resultsTable.extTable(
            expBankResult,
            parentTableResult
            )

        //console.log(`extensionTable(${id},${this.printObject(inputs)}) = ${extTable}`)
        
        this.resultsMap.set(id,extTable)
        return extTable
    }

    // UTILITY
    applyComparer(comparer,valueA,valueB) {
        let result = false
        switch(comparer) {
            case "=":
            result = valueA === valueB
            break

            case ">":
            result = valueA > valueB
            break

            case ">=":
            result = valueA >= valueB
            break

            case "<":
            result = valueA < valueB
            break

            case "<=":
            result = valueA <= valueB
            break

            default: // treat as "="
            result = valueA === valueB
            break
        }
        return result
    }

/*  term state:     isWholeColumn       true/false      do first
                    isRowFunc           true/false      
                    containsWholeColumn true/false      wait until wholecolumn computed
                    containsRowFunc     true/false      wait until rowfunc computed
                    containsKeyword     true/false      lookup keywords
                    isComputed          true/false      returns number/text

        RowN    ==>  1. Lookup precomputeds (keywords & columnfuncs, ex "present","columnsum(fa)")
                ==>  2. Lookup row values (ex "dob","fa")
                ==>  3. Iterate term functions
                            a. Feed in looked-up values from above
                            b. Compute term, store in Map
                            c. Move to next term-func or goto next row

        ex  "(faceamount / columnsum(faceamount)) * yearsbetween(dob,present)"
                Precompute:     exp = expRaw.replace(keywords,keywordValueMap.get(keyword))
                                exp.match(rgx) =>   wholeColumnTerms
                                                    rowFuncTerms

                                termCalcTree

                                Keyword values gotten like this: keywordValueMap.get("present")
                                Find whole-column terms and compute & store them:
                                    columnsum(faceamount) = 1,250,000
                                    wholeColumnFunMap.set("columnsum(faceamount)",1250000)
                                exp.

*/
    parseExpression(exp) {
        const nest = getNested(exp)
        return nest
    }

    yearsbetween(dateA,dateB) {}
}
