const Sequelize = require('sequelize')
const {
  dbName,
  host, 
  port,
  user,
  password 
} = require('../config/config').database

const sequelize = new Sequelize(dbName, user, password, {
  // dislect 指定数据库的类型
  dialect: 'mysql',
  host,
  port,
  logging:true,
  timezone:'+11:00',
  define: {
    // create_time. upate_time. delete_time
    timestamps:false,
    paranoid: true,
    createdAt:'created_at',
    updatedAt:'updated_at',
    deletedAt:'deleted_at',
    underscored:true
  }
})

sequelize.sync({
  force: true
})

module.exports = {
  sequelize
}