/** ORM models, using `sequelize` */
// imports
const { Sequelize, Model, DataTypes } = require('sequelize')
const path = require('path')

// define connection
const conn = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'db.sqlite3')
})

// define models
class Doc extends Model {}
Doc.init({  // fields
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    body: {
        type: DataTypes.STRING
    }
}, {
    sequelize: conn,
    modelName: 'doc'  // table name
})


// migrate database; only execute once
// conn.sync()

// exports
exports.conn = conn
exports.Doc = Doc
