const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const { addDays } = require('date-fns');
const { getCrewOnBoard } = require('./crewOnBoard'); // Ensure correct relative path to crewOnBoard.js
const { isNumber } = require('./utils'); // Ensure correct relative path to utils.js
const router = express.Router();
const { getEmpPhone } = require('./getEmpPhone');

const token = '6887434002:AAEaPPWU1wfdn8fBC7hRkjkjwdo_KPQ_61o';
const bot = new TelegramBot(token, { polling: true });

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text.trim().toLowerCase();

  if (messageText === '/start') {
    bot.sendMessage(chatId, 'Welcome to the bot!');
  } else if (messageText.startsWith('co')) {
    try {
      let SendMSG = "";
      let Cc = "";
      let fltno = "";
      let msgcount = messageText.length;

      if (msgcount > 2) {
        fltno = messageText.substring(2).trim();
      }

      if (fltno && !fltno.includes(",") && isNumber(fltno)) {
        Cc = await getCrewOnBoard(fltno, new Date(), "ADD");
      } else if (fltno.includes(",") && !fltno.includes("-")) {
        let fdetail = fltno.split(',');
        let mcount = fdetail.length;

        if (mcount === 2) {
          fltno = fdetail[0];
          let ndays = fdetail[1];
          let chekfltno = isNumber(fltno);
          let checkdep = isNumber(ndays);

          if (chekfltno && checkdep) {
            Cc = await getCrewOnBoard(fltno, addDays(new Date(), parseFloat(ndays)), "ADD");
          } else if (chekfltno && !checkdep) {
            Cc = await getCrewOnBoard(fltno, new Date(), ndays.toUpperCase());
          } else {
            SendMSG = "\nPlease double-check your input.";
            SendMSG += `\nOr you are not assigned to ET-${fltno}`;
            SendMSG += "\nThe New Spirit of Africa";
            SendMSG += "\nwww.ethiopianairlines.com";
            await bot.sendMessage(chatId, `Hello ${msg.chat.username}\n\n${SendMSG}`);
          }
        } else if (mcount > 2) {
          fltno = fdetail[0];
          let ndays = fdetail[1];
          let dep = fdetail[2];
          let chekfltno = isNumber(fltno);
          if (chekfltno) {
            Cc = await getCrewOnBoard(fltno, addDays(new Date(), parseFloat(ndays)), dep.toUpperCase());
          } else {
            SendMSG = "\nPlease double-check your input.";
            SendMSG += `\nOr you are not assigned to ET-${fltno}`;
            SendMSG += "\nThe New Spirit of Africa";
            SendMSG += "\nwww.ethiopianairlines.com";
            await bot.sendMessage(chatId, `Hello ${msg.chat.username}\n\n${SendMSG}`);
          }
        }
      } else if (fltno.includes(",") && fltno.includes("-")) {
        let fdetail = fltno.split(',');
        let mcount = fdetail.length;

        if (mcount === 2) {
          fltno = fdetail[0];
          let ndays = fdetail[1].replace("-", "");
          let chekfltno = isNumber(fltno);
          let checkdep = isNumber(ndays);

          if (chekfltno && checkdep) {
            Cc = await getCrewOnBoard(fltno, addDays(new Date(), -parseFloat(ndays)), "ADD");
          } else {
            SendMSG = "\nPlease double-check your input.";
            SendMSG += `\nOr you are not assigned to ET-${fltno}`;
            SendMSG += "\nThe New Spirit of Africa";
            SendMSG += "\nwww.ethiopianairlines.com";
            await bot.sendMessage(chatId, `Hello ${msg.chat.username}\n\n${SendMSG}`);
          }
        } else if (mcount > 2) {
          fltno = fdetail[0];
          let ndays = fdetail[1].replace("-", "");
          let dep = fdetail[2];
          let checkdat = isNumber(ndays);
          let chekfltno = isNumber(fltno);

          if (chekfltno && checkdat) {
            Cc = await getCrewOnBoard(fltno, addDays(new Date(), -parseFloat(ndays)), dep.toUpperCase());
          } else {
            SendMSG = "\nPlease double-check your input.";
            SendMSG += `\nOr you are not assigned to ET-${fltno}`;
            SendMSG += "\nThe New Spirit of Africa";
            SendMSG += "\nwww.ethiopianairlines.com";
            await bot.sendMessage(chatId, `Hello ${msg.chat.username}\n\n${SendMSG}`);
          }
        }
      } else {
        SendMSG = "\nPlease double-check your input.";
        SendMSG += `\nor you are not assigned to ET-${fltno}`;
        SendMSG += "\nThe New Spirit of Africa";
        SendMSG += "\nwww.ethiopianairlines.com";
        await bot.sendMessage(chatId, `Hello ${msg.chat.username}\n\n${SendMSG}`);
      }

      if (Cc) {
        await bot.sendMessage(chatId, `Hello ${msg.chat.username} \n\n${Cc}\n\nThe New Spirit of Africa\nwww.ethiopianairlines.com`);
      }
    } catch (e) {
      console.error(`Error handling message: ${e.message}`);
      await bot.sendMessage(chatId, `Hello ${msg.chat.username}\n\nWe regret to inform you that the system is not able to process your request at this moment.\nKindly check your spelling and try again.\n\nWe thank you for choosing ET-The New Spirit of Africa\n\nBest Regards,\nET-Online Support Team\n\nwww.ethiopianairlines.com`);
    }
  }else if (messageText.startsWith('ph')) {
    try {
      let tmsg = messageText.substring(2).trim();
      tmsg = tmsg.replace(/\D/g, ''); // Remove all non-digit characters
      if (isNumber(tmsg)) {
        let strEMNUMBE = tmsg;
        if (strEMNUMBE.length === 7) strEMNUMBE = "0" + strEMNUMBE;
        if (strEMNUMBE.length === 6) strEMNUMBE = "00" + strEMNUMBE;
        if (strEMNUMBE.length === 5) strEMNUMBE = "000" + strEMNUMBE;
        if (strEMNUMBE.length === 4) strEMNUMBE = "0000" + strEMNUMBE;
        if (strEMNUMBE.length === 3) strEMNUMBE = "00000" + strEMNUMBE;

        const ph = await getEmpPhone(strEMNUMBE);
        let SendMSG = ph ? `${ph}\nThe New Spirit of Africa\nwww.ethiopianairlines.com` : "Please double-check your input.\nThe New Spirit of Africa\nwww.ethiopianairlines.com";
        await bot.sendMessage(chatId, `Hello ${msg.chat.username}\n\n${SendMSG}`);
      } else {
        let SendMSG = "Please double-check your input.\nThe New Spirit of Africa\nwww.ethiopianairlines.com";
        await bot.sendMessage(chatId, `Hello ${msg.chat.username}\n\n${SendMSG}`);
      }
    } catch (e) {
      console.error(`Error handling message: ${e.message}`);
      let SendMSG = "We regret to inform you that the system is not able to process your request at this moment.\nKindly check your spelling and try again.\n\nWe thank you for choosing ET-The New Spirit of Africa\n\nBest Regards,\nET-Online Support Team\n\nwww.ethiopianairlines.com";
      await bot.sendMessage(chatId, `Hello ${msg.chat.username}\n\n${SendMSG}`);
    }
  }
});

module.exports = router;