import Sequelize from 'sequelize'

const arena = (sequelize, DataTypes) => {
    console.log('arena model being made...')

    sequelize.authenticate().then(()=>{
        console.log('db authenticated..')
    })

    const Arenas = sequelize.define('arenas',
    {
        arena_name: { type: Sequelize.STRING },
        nodeid:     { type: Sequelize.STRING },
        nodename:   { type: Sequelize.STRING },
        x:          { type: Sequelize.INTEGER },
        y:          { type: Sequelize.INTEGER },
        func:       { type: Sequelize.STRING },
        inputs:     { type: Sequelize.JSON },
        id:         { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, unique: true }
    },
    {
        tableName: 'arenas',
        timestamps: false
    }
    )

    const arenaExists = arenaName => Arenas.findOne({
            where: { arena_name: arenaName }
        })
        .then(a => a === null ? false : true
        )
        .catch(() => false)

    const enterArena = async (arenaName,nodeInfos) => {
        console.log('arenaName: ',arenaName)
        console.log('nodeInfos: ',nodeInfos)

        const nodeEntries = []

        nodeInfos.forEach(({arenaName,nodeID,name,x,y,func,inputs}) => {
            nodeEntries.push({
                arena_name: arenaName,
                nodeid: nodeID,
                nodename: name,
                x, y,
                func,
                inputs
            })
        })

        const arenaExistsPromise = new Promise((resolve,reject) => {
            return arenaExists(arenaName)
                .then(exists => resolve(exists))
                .catch(err => reject(err))
        })

        return arenaExistsPromise
            .then(exists => {
                if (exists) {
                    console.log('exists: ',exists)
                    console.log('Arena not saved: already exists')
                    return false
                }

                return Arenas.bulkCreate(nodeEntries)
                        .then(a => console.log('a: ',a))
                        .catch(err => console.log(err))
            })
            .catch(err => console.log(err))
    }
    
    const lookupArena = async arenaName => await Arenas.findAll({
        where: { arena_name: arenaName }
        })
        .then(arena => {
            let arenaNodes = []
            let {arena_name,nodeid,nodename} = arena
            arena.forEach(nodeData => {
                let {arena_name,nodeid,nodename} = nodeData
                arenaNodes.push(Object.assign({},nodeData.dataValues,{
                    arenaName: arena_name,
                    nodeID: nodeid,
                    name: nodename
            }))}
            )
            
            return arenaNodes
        })
        .catch(err => err)

    const lookupArenaNames = async () => Arenas.findAll()
        .then(arenas => {
            const allNames = arenas.map(arena => arena.dataValues.arena_name)
            const allNamesOnce = []
            allNames.forEach(name => {
                if (allNamesOnce.includes(name)) return
                allNamesOnce.push(name)
            })
            return allNamesOnce
        })


    return {enterArena,lookupArena,lookupArenaNames}
}

export default arena
