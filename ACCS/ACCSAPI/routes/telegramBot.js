// routes/telegramBot.js
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const router = express.Router();

const token = '6887434002:AAEaPPWU1wfdn8fBC7hRkjkjwdo_KPQ_61o'; // Replace with your own bot token
const bot = new TelegramBot(token, { polling: true });

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;

  if (messageText === '/start') {
    bot.sendMessage(chatId, 'Welcome to the bot!');
  } else {
    bot.sendMessage(chatId, 'It is hi!');
  }
});

// You can add more bot-specific routes or functionalities here if needed

module.exports = router;
