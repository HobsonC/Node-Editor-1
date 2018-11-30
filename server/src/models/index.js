import Sequelize from 'sequelize'

const sequelize = new Sequelize('postgres://dbuser01@localhost:5432/neinsdb_backup')

const models = {
    Table: sequelize.import('./table'),
    Policy: sequelize.import('./policy'),
    Arena: sequelize.import('./arena')
    //User: sequelize.import('./user'),
    //Message: sequelize.import('./message')
}

Object.keys(models).forEach(key => {
    if ('associate' in models[key]) {
        models[key].associate(models)
    }
})

export { sequelize }

export default models