const policy = (sequelize, DataTypes) => {
    const Policy = sequelize.define('policies_small',
        {
            id: { 
                type: DataTypes.INTEGER, primaryKey: true,
                unique: true,
                allowNull: false,
                validate: { notEmpty: true }
            },
            policynumber: { 
                type: DataTypes.INTEGER,
                unique: true,
                allowNull: false,
                validate: { notEmpty: true }
                },
            name: {
                type: DataTypes.TEXT,
                unique: true,
                allowNull: false,
                validate: { notEmpty: true}
            },
            dob: {
                type: DataTypes.TEXT,
                unique: true,
                allowNull: false,
                validate: { notEmpty: true }
                },
            dop: { 
                type: DataTypes.TEXT,
                unique: true,
                allowNull: false,
                validate: { notEmpty: true}
            },
            gender: { 
                type: DataTypes.TEXT,
                unique: true,
                allowNull: false,
                validate: { notEmpty: true}
            },
            smokingstatus: { 
                type: DataTypes.TEXT,
                unique: true,
                allowNull: false,
                validate: { notEmpty: true}
            },
            faceamount: { 
                type: DataTypes.INTEGER,
                unique: true,
                allowNull: false,
                validate: { notEmpty: true}
            }
        },
        {
            freezeTableName: true,
            tablename: 'policies_small'
        }
    )

    return Policy
}

export default policy


/*        name:       {   type: DataTypes.STRING  },
        dob:        {   type: DataTypes.DATEONLY,
                        validate: { isAfter: "1900-01-01" }},
        dop:        {   type: DataTypes.DATEONLY,
                        validate: { isAfter: "1950-01-01" }},
        gender:     {   type: DataTypes.STRING,
                        validate: { isIn: ['m','f']}  },
        smokingStatus: { type: DataTypes.STRING,
                        validate: { isIn: ['sm','ns'] } },
        faceAmount: {   type: DataTypes.INTEGER,
                        validate: { min: 10000 }} */