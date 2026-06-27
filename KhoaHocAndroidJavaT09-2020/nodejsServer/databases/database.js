const mysql = require('mysql')
const mysql2 = require('mysql2')
const { Sequelize } = require('sequelize')
const  {
    MAXMUM_FILE_SIZE, 
    PORT,
    HOSTNAME,
    DB_PORT,
    DB_NAME,
    DB_USERNAME,
    DB_PASSWORD
} = require('../constants/constants')

const sequelize = new Sequelize(
    DB_NAME,
    DB_USERNAME,
    DB_PASSWORD,
    {
      dialect: 'mysql',
      dialectModule: mysql2, 
      host: HOSTNAME,
      port: DB_PORT
    }
  )

sequelize.authenticate()
  .then(() => {
      console.log('Connection Sequelize successfully.');
  }).catch(err => {
      console.error('Sequelize connect database failed:', err);
  })
  
module.exports = {
    sequelize
}