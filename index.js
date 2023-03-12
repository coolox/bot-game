const TelegramApi = require('node-telegram-bot-api')
const { gameOptions, againOptions } = require('./options')
const sequelize = require('./db')
const UserModel = require('./models')

const token = '6239067337:AAHb7yvjwJJBFo2umdEgzBIi-nulK6RQlhE'

const bot = new TelegramApi(token, { polling: true })

const chats = {}



const startGame = async (chatId) => {
  await bot.sendMessage(chatId, 'Сейчас я загадываю число от 0 до 9, а ты должен ее угадать')
  const randomNumber = Math.floor(Math.random() * 10)
  chats[chatId] = randomNumber
  await bot.sendMessage(chatId, 'Отгадывай', gameOptions)
}

const start = async () => {

  try {
    await sequelize.authenticate()
    await sequelize.sync()

  } catch (e) {
    console.log('Podklyuchenie slomalos', e)
  }
  bot.setMyCommands([
    {command: '/start', description: 'Начальное приветствие'},
    {command: '/info', description: 'Получть информацию о пользователе'},
    {command: '/game', description: 'Начать игру'}
  ])
  
  bot.on('message', async msg => {
    const text = msg.text
    const chatId = msg.chat.id

    try {
      if (text === '/start') {
        await UserModel.create({chatId})
        await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/a20/d3e/a20d3e8e-c30a-40fa-8646-9d82f922ad02/5.webp')
        return bot.sendMessage(chatId, 'Добро пожаловать к боту по Нумерологии')
      }
      if (text === '/info') {
        const user= await UserModel.findOne({chatId})
        return bot.sendMessage(chatId, `Тебя зовут, ${msg.from.first_name}, в игре у тебя правильных ответов ${user.right}, непрвильных ${user.wrong}`)
      }
      if (text==='/game') {
        return startGame(chatId)
      }
      return bot.sendMessage(chatId, 'Я тебя не понимаю')
      
    } catch (e) {
      return bot.sendMessage(chatId, 'Произошла какаято ошибка')
    }
  
  })

  bot.on('callback_query', async msg => {
    const data = msg.data
    const chatId = msg.message.chat.id
    if (data === '/game') {
      return startGame(chatId)
    }
    const user = await UserModel.findOne({chatId})
    if (data == chats[chatId]) {
      user.right += 1
      await bot.sendMessage(chatId, `Поздравляю ты угодал цыфру ${chats[chatId]}`, againOptions)
    } else {
      user.wrong += 1 
      await bot.sendMessage(chatId, `К сожелению ты не угодал, бот загадал цыфру ${chats[chatId]}`, againOptions)
    }
    await user.save()
  })
}

start()