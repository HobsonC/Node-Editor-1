const table = (sequelize, DataTypes) => {
    const getTable = async table => sequelize.query(`
    SELECT *
    FROM public.${table};`, { type: sequelize.QueryTypes.SELECT })
    .then(tableResult => {
        return tableResult
    })
    .catch(err=>[])

    const getAllTableNames = () => sequelize.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema='public'
    AND table_type='BASE TABLE';`, { type: sequelize.QueryTypes.SELECT })
    .then(tableNames=>{
        let result = []
        tableNames.forEach(tableName => {
            result.push(tableName.table_name)
        })
        return result
    })
    .catch(err=>[])

    const getTableNames = tableType => getAllTableNames()
        .then(allTables => {
            let allTypeTables = []
            let prefix = ""
            switch(tableType) {
                case "Mortality":
                prefix = "mort_"
                break

                case "Interest":
                prefix = "int_"
                break

                default: break
            }
            
            allTables.forEach(t => {
                t.startsWith(prefix) ? allTypeTables.push(t) : {}
            })

            return allTypeTables
        })
        .catch(err => [])

        const getTableInfo = tableName => sequelize.query(`
            SELECT column_name,data_type
            FROM information_schema.columns
            WHERE table_name = '${tableName}';`,
            { type: sequelize.QueryTypes.SELECT })
            .then(columnInfos => {
                //console.log('tableName: ',tableName)
                let columns = []
                columnInfos.forEach(columnInfo => {
                    let { column_name, data_type } = columnInfo
                    columns.push({name: column_name, dataType: data_type})
                })
                let result = { name: tableName, columns }
                
                return { name: tableName, columns }
            })
            .catch(err => [])

        const getTablesInfo = tableNames => {
            let tableInfos = []
            tableNames.forEach(tableName => {
                tableInfos.push(getTableInfo(tableName))
            })
            return tableInfos
        }

    return {getTable,getAllTableNames,getTableNames,getTableInfo,getTablesInfo}
}

export default table
