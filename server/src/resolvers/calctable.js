import Bluebird from 'bluebird'
import NodeFuncs from './NodeFuncs'
// Warning originates from NodeFuncs.func(getDBTable) not being waited for
export default {
    Query: {
        calcResultsTable: async (parent,args,{models,sequelize}) => {
            //console.log('args: ',args)
            const nodeFuncs = new NodeFuncs(models,sequelize)
/*            const allPromiseFuncs = args.calcTable.map(({id,func,inputs}) => new Promise((resolve,reject) => {
                console.log('allPromiseFuncs')
                if (nodeFuncs.funcExists(func)) {
                    console.log('allPromiseFuncs.if(nodeFuncs...')
                    resolve(nodeFuncs.func(id,func,inputs))
                }
                else reject(`Error with (${id},${func})`)
            }))
*/
            return Bluebird.each(args.calcTable,({id,func,inputs})=>{
                return new Promise((resolve,reject) => {
                    if (nodeFuncs.funcExists(func)) {
                        if (func==='getDBTable') {
                            nodeFuncs.func(id,func,inputs).then(t => resolve(t))
                        }
                        else resolve(nodeFuncs.func(id,func,inputs))
                    }
                    else reject(`Error with (${id},${func})`)
                })
            }).then(r => {
                //console.log('r: ',r)
                let resultsTable = nodeFuncs.getResultsMap()
                //console.log('resultsTable: ',resultsTable)
                const resultJSON = {}
                resultsTable.forEach((row,index) => {
                    resultJSON[index] = row
                })
                return resultJSON
            }).catch(err => {
                //console.log('err: ',err)
                let resultsTable = nodeFuncs.getResultsMap()
                //console.log('resultsTable: ',resultsTable)
                return resultsTable
            })
        }
    }
}