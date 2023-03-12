const {Sequelize} = require('sequelize')

module.exports = new Sequelize(
  'bot_game_DB',
  'zengin',
  'Side2023',
  {
    host: 'bot-game-db.cme4toqoizzu.eu-north-1.rds.amazonaws.com',
    port: '5432',
    dialect: 'postgres'
  }
)