const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const { addDays } = require('date-fns');
const { getCrewOnBoard } = require('./crewOnBoard'); 
const { SEND } = require('./smsGateway');
const { isNumber } = require('./utils'); 
const router = express.Router();
const { getEmpPhone } = require('./GetCrewPhone');
const { checkBotuser } = require('./checTkuser');
const { empnoreturn } = require('./empnumreturnfromLDB');
const { getEmpStatus } = require('./GetEmpCurrentStatus');
const { botReg } = require('./UserReg');
const { CrewBasicData } = require('./ReturnCrewBasicData');
const { getFlightSchedule } = require('./GetFlightInfo');
const { GetCrewRoster  } = require('./GetEmployeeRoster' );
const { getEmpEmail  } = require('./GetCrewEmail' );
const { CrewNameAndqual  } = require('./ReturnCrewNameandQual' );
const {  SaveFreeTextFromCrew } = require('./SaveFreeText' );
const {  ReturnPhoneNumber } = require('./EmpreturnPhoneLDB' );
const axios = require('axios');
const token = '6887434002:AAEaPPWU1wfdn8fBC7hRkjkjwdo_KPQ_61o';
const bot = new TelegramBot(token, { polling: true });

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  console.log(chatId);
  const ChatUsername = msg.chat.username;
  const messageText = msg.text.trim().toLowerCase();
  let strEmpnumber = "";
  let strEMpStatus = "";
  let userID = await checkBotuser(chatId);

////////////////////////////////
  if (userID !== "NO" && (!messageText.toLowerCase().startsWith("rg"))) {
   
   strEmpnumber = await empnoreturn(chatId);
   strEMpStatus = await getEmpStatus(strEmpnumber);
   console.log(strEMpStatus +"  " + strEmpnumber +"  " + messageText);
    
  }
  else if (userID === "NO" && messageText.toLowerCase().startsWith("rg")) {
  console.log(messageText.substring(2).toLowerCase()); 
  const PH = messageText.substring(2).split('').filter(char => /\d/.test(char)).join(''); // extract crew phone number from message  text
  const pcount = PH.length;
  if (pcount >= 10) {
    let newPH = PH;
    if (pcount === 10) {
      newPH = "251" + PH.slice(1);
    } else if (pcount === 13) {
      newPH = PH;
    }
    const newrg = await botReg(newPH ,messageText ,chatId ,ChatUsername)
    console.log("Reg result ",newrg);
    bot.sendMessage(chatId, newrg);
    return;
  }
  }else{
    let SendMSG = "Access Restricted! \n\nThis service is exclusively available to authorized users. If you believe you should have access, please contact the HR team for assistance. \nTo register, please send a     message in the format: rg followed by your primary mobile phone number (e.g., rg0911...)  \n Thank you for your understanding. "
    bot.sendMessage(chatId, SendMSG);

    return;
  }

if (messageText.startsWith('start')) {
let sendMsg = "";
sendMsg += "Welcome to the bot!\n";
sendMsg += "1. Registration: \n   `Rg <Employee Primary Phone>`\n";
sendMsg += "2. Roster Request: \n   `RS <Number of Days>`\n";
sendMsg += "3. Employee Roster: \n   `ER <Employee Number>`\n";
sendMsg += "4. Crew on Board: \n   `CO <Flight Number>`\n";
sendMsg += "5. Flight Information: \n   `FN <Flight Number>`\n";
sendMsg += "6. Personal Data: \n   `PD`\n";
sendMsg += "7. Employee Phone Number: \n   `PH <Employee Number>`\n";
sendMsg += "8. Employee Email: \n   `EM <Employee Number>`\n";
sendMsg += "9. ID Replacement: \n   `IR <New ID>`\n";
sendMsg += "\nThe New Spirit of Africa\n";
sendMsg += "Visit us at: www.ethiopianairlines.com";
    bot.sendMessage(chatId, sendMsg );
    //below if is to handeling crew on board request
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
		SEND('+251920569322', SendMSG)
    .then(result => {
        console.log(result);
    })
    .catch(error => {
        console.error(error.message);
    });
			
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
			SEND('+251920569322', SendMSG)
    .then(result => {
        console.log(result);
    })
    .catch(error => {
        console.error(error.message);
    });
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
		SEND('+251920569322', SendMSG)
    .then(result => {
        console.log(result);
    })
    .catch(error => {
        console.error(error.message);
    });
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
			SEND('+251920569322', SendMSG)
    .then(result => {
        console.log(result);
    })
    .catch(error => {
        console.error(error.message);
    });
          }
        }
      } else {
        SendMSG = "\nPlease double-check your input.";
        SendMSG += `\nor you are not assigned to ET-${fltno}`;
        SendMSG += "\nThe New Spirit of Africa";
        SendMSG += "\nwww.ethiopianairlines.com";
        await bot.sendMessage(chatId, `Hello ${msg.chat.username}\n\n${SendMSG}`);
		SEND('+251920569322', SendMSG)
    .then(result => {
        console.log(result);
    })
    .catch(error => {
        console.error(error.message);
    });
      }

      if (Cc) {
        await bot.sendMessage(chatId, `Hello ${msg.chat.username} \n\n${Cc}\n\nThe New Spirit of Africa\nwww.ethiopianairlines.com`);
			SEND('+251920569322', Cc)
    .then(result => {
        console.log(result);
    })
    .catch(error => {
        console.error(error.message);
    });
      }
    } catch (e) {
      console.error(`Error handling message: ${e.message}`);
      await bot.sendMessage(chatId, `Hello ${msg.chat.username}\n\nWe regret to inform you that the system is not able to process your request at this moment.\nKindly check your spelling and try again.\n\nWe thank you for choosing ET-The New Spirit of Africa\n\nBest Regards,\nET-Online Support Team\n\nwww.ethiopianairlines.com`);
    	SEND('+251920569322', 'We regret to inform you that the system is not able to process your request at this moment.\nKindly check your spelling and try again.\n\nWe thank you for choosing ET-The New Spirit of Africa\n\nBest Regards,\nET-Online Support Team\n\nwww.ethiopianairlines.com')
    .then(result => {
        console.log(result);
    })
    .catch(error => {
        console.error(error.message);
    });
	}
//handl flight information request 
  }else if (messageText.startsWith('fn')) {
    try {
      let SendMSG = "";
      let Cc = "";
      let fltno = "";
      let msgcount = messageText.length;

      if (msgcount > 2) {
        fltno = messageText.substring(2).trim();
      }

      if (fltno && !fltno.includes(",") && isNumber(fltno)) {
        Cc = await getFlightSchedule(fltno, new Date(), "ADD");
      } else if (fltno.includes(",") && !fltno.includes("-")) {
        let fdetail = fltno.split(',');
        let mcount = fdetail.length;

        if (mcount === 2) {
          fltno = fdetail[0];
          let ndays = fdetail[1];
          let chekfltno = isNumber(fltno);
          let checkdep = isNumber(ndays);

          if (chekfltno && checkdep) {
            Cc = await getFlightSchedule(fltno, addDays(new Date(), parseFloat(ndays)), "ADD");
          } else if (chekfltno && !checkdep) {
            Cc = await getFlightSchedule(fltno, new Date(), ndays.toUpperCase());
          } else {
            SendMSG = "\nPlease double-check your input.";
            SendMSG += `\nOr you are not assigned to ET-${fltno}`;
            SendMSG += "\nThe New Spirit of Africa";
            SendMSG += "\nwww.ethiopianairlines.com";
            await bot.sendMessage(chatId, `Hello ${msg.chat.username}\n\n${SendMSG}`);
		SEND('+251920569322', SendMSG)
    .then(result => {
        console.log(result);
    })
    .catch(error => {
        console.error(error.message);
    });
			
          }
        } else if (mcount > 2) {
          fltno = fdetail[0];
          let ndays = fdetail[1];
          let dep = fdetail[2];
          let chekfltno = isNumber(fltno);
          if (chekfltno) {
            Cc = await getFlightSchedule(fltno, addDays(new Date(), parseFloat(ndays)), dep.toUpperCase());
          } else {
            SendMSG = "\nPlease double-check your input.";
            SendMSG += `\nOr you are not assigned to ET-${fltno}`;
            SendMSG += "\nThe New Spirit of Africa";
            SendMSG += "\nwww.ethiopianairlines.com";
            await bot.sendMessage(chatId, `Hello ${msg.chat.username}\n\n${SendMSG}`);
			SEND('+251920569322', SendMSG)
    .then(result => {
        console.log(result);
    })
    .catch(error => {
        console.error(error.message);
    });
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
            Cc = await getFlightSchedule(fltno, addDays(new Date(), -parseFloat(ndays)), "ADD");
          } else {
            SendMSG = "\nPlease double-check your input.";
            SendMSG += `\nOr you are not assigned to ET-${fltno}`;
            SendMSG += "\nThe New Spirit of Africa";
            SendMSG += "\nwww.ethiopianairlines.com";
            await bot.sendMessage(chatId, `Hello ${msg.chat.username}\n\n${SendMSG}`);
		SEND('+251920569322', SendMSG)
    .then(result => {
        console.log(result);
    })
    .catch(error => {
        console.error(error.message);
    });
          }
        } else if (mcount > 2) {
          fltno = fdetail[0];
          let ndays = fdetail[1].replace("-", "");
          let dep = fdetail[2];
          let checkdat = isNumber(ndays);
          let chekfltno = isNumber(fltno);

          if (chekfltno && checkdat) {
            Cc = await getFlightSchedule(fltno, addDays(new Date(), -parseFloat(ndays)), dep.toUpperCase());
          } else {
            SendMSG = "\nPlease double-check your input.";
            SendMSG += `\nOr you are not assigned to ET-${fltno}`;
            SendMSG += "\nThe New Spirit of Africa";
            SendMSG += "\nwww.ethiopianairlines.com";
            await bot.sendMessage(chatId, `Hello ${msg.chat.username}\n\n${SendMSG}`);
			SEND('+251920569322', SendMSG)
    .then(result => {
        console.log(result);
    })
    .catch(error => {
        console.error(error.message);
    });
          }
        }
      } else {
        SendMSG = "\nPlease double-check your input.";
        SendMSG += `\nor you are not assigned to ET-${fltno}`;
        SendMSG += "\nThe New Spirit of Africa";
        SendMSG += "\nwww.ethiopianairlines.com";
        await bot.sendMessage(chatId, `Hello ${msg.chat.username}\n\n${SendMSG}`);
		SEND('+251920569322', SendMSG)
    .then(result => {
        console.log(result);
    })
    .catch(error => {
        console.error(error.message);
    });
      }

      if (Cc) {
        await bot.sendMessage(chatId, `Hello ${msg.chat.username} \n\n${Cc}\n\nThe New Spirit of Africa\nwww.ethiopianairlines.com`);
			SEND('+251920569322', Cc)
    .then(result => {
        console.log(result);
    })
    .catch(error => {
        console.error(error.message);
    });
      }
    } catch (e) {
      console.error(`Error handling message: ${e.message}`);
      await bot.sendMessage(chatId, `Hello ${msg.chat.username}\n\nWe regret to inform you that the system is not able to process your request at this moment.\nKindly check your spelling and try again.\n\nWe thank you for choosing ET-The New Spirit of Africa\n\nBest Regards,\nET-Online Support Team\n\nwww.ethiopianairlines.com`);
    	SEND('+251920569322', 'We regret to inform you that the system is not able to process your request at this moment.\nKindly check your spelling and try again.\n\nWe thank you for choosing ET-The New Spirit of Africa\n\nBest Regards,\nET-Online Support Team\n\nwww.ethiopianairlines.com')
    .then(result => {
        console.log(result);
    })
    .catch(error => {
        console.error(error.message);
    });
	}
//handl roster request
  }else if(messageText.startsWith('rs')){
        let tmsg = messageText.substring(2).trim();
        console.log(tmsg);  
       tmsg = tmsg.replace(/\D/g, '');
           console.log(tmsg);  
         let SendMSG = "";
        if(isNumber(tmsg)){
SendMSG = await GetCrewRoster(strEmpnumber ,tmsg);
                  await bot.sendMessage(chatId, `Hello ${msg.chat.username}\n\n${SendMSG}`);
        }else{
              SendMSG =  "Please send number only after rs to request roster\n\nThe New Spirit of Africa\nwww.ethiopianairlines.com ";
        await bot.sendMessage(chatId, `Hello ${msg.chat.username}\n\n${SendMSG}`);
        }


  }
  //handl phone number request
  else if (messageText.startsWith('ph')) {
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
        let SendMSG = ph ? `${ph}\n\nThe New Spirit of Africa\nwww.ethiopianairlines.com` : "Please double-check your input.\nThe New Spirit of Africa\nwww.ethiopianairlines.com";
        await bot.sendMessage(chatId, `Hello ${msg.chat.username}\n\n${SendMSG}`);
		SEND('+251920569322', SendMSG)
    .then(result => {
        console.log(result);
    })
    .catch(error => {
        console.error(error.message);
    });
      } else {
        let SendMSG = "Please double-check your input.\nThe New Spirit of Africa\nwww.ethiopianairlines.com";
        await bot.sendMessage(chatId, `Hello ${msg.chat.username}\n\n${SendMSG}\n`);
		SEND('+251920569322', SendMSG)
    .then(result => {
        console.log(result);
    })
    .catch(error => {
        console.error(error.message);
    });
      }
    } catch (e) {
      console.error(`Error handling message: ${e.message}`);
      let SendMSG = "We regret to inform you that the system is not able to process your request at this moment.\nKindly check your spelling and try again.\n\nWe thank you for choosing ET-The New Spirit of Africa\n\nBest Regards,\nET-Online Support Team\n\nwww.ethiopianairlines.com";
      await bot.sendMessage(chatId, `Hello ${msg.chat.username}\n\n${SendMSG}`);
	  SEND('+251920569322', SendMSG)
    .then(result => {
        console.log(result);
    })
    .catch(error => {
        console.error(error.message);
    });
    }
  }
  //handle crew email request
    else if (messageText.startsWith('em')) {
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

        const ph = await getEmpEmail(strEMNUMBE);
        let SendMSG = ph ? `${ph}\n\nThe New Spirit of Africa\nwww.ethiopianairlines.com` : "Please double-check your input.\nThe New Spirit of Africa\nwww.ethiopianairlines.com";
        await bot.sendMessage(chatId, `Hello ${msg.chat.username}\n\n${SendMSG}`);
		SEND('+251920569322', SendMSG)
    .then(result => {
        console.log(result);
    })
    .catch(error => {
        console.error(error.message);
    });
      } else {
        let SendMSG = "Please double-check your input.\nThe New Spirit of Africa\nwww.ethiopianairlines.com";
        await bot.sendMessage(chatId, `Hello ${msg.chat.username}\n\n${SendMSG}\n`);
		SEND('+251920569322', SendMSG)
    .then(result => {
        console.log(result);
    })
    .catch(error => {
        console.error(error.message);
    });
      }
    } catch (e) {
      console.error(`Error handling message: ${e.message}`);
      let SendMSG = "We regret to inform you that the system is not able to process your request at this moment.\nKindly check your spelling and try again.\n\nWe thank you for choosing ET-The New Spirit of Africa\n\nBest Regards,\nET-Online Support Team\n\nwww.ethiopianairlines.com";
      await bot.sendMessage(chatId, `Hello ${msg.chat.username}\n\n${SendMSG}`);
	  SEND('+251920569322', SendMSG)
    .then(result => {
        console.log(result);
    })
    .catch(error => {
        console.error(error.message);
    });
    }
  }
  //handle personal information
  else if(messageText.startsWith('pd')){
  const BasicD = await CrewBasicData(strEmpnumber);
        let SendMSG = BasicD ? `${BasicD}\nThe New Spirit of Africa\nwww.ethiopianairlines.com` : "Please double-check your input.\nThe New Spirit of Africa\nwww.ethiopianairlines.com";
        await bot.sendMessage(chatId, `Hello ${msg.chat.username}\n\n${SendMSG}`);

  }else if (messageText.startsWith('er')) {
	  let msg = messageText;
    let strempno = "";
    let msgcount = msg.length;
    let CR = "";
    let ndate = "";
    let checkndate = false;
    let checkidempno = isNumber(msg.substring(2));

    if (msgcount > 2 && !msg.substring(2).includes(",") && checkidempno) {
        strempno = msg.substring(2);
    }

    if (msg.substring(2).includes(",")) {
        let empdetail = msg.substring(2).split(',');

        if (empdetail.length > 1) {
            checkidempno = isNumber(empdetail[0]);
            checkndate = isNumber(empdetail[1]);
            if (checkidempno && checkndate) {
                strempno = empdetail[0];
                ndate = empdetail[1];
            }
        }
    }

    if (strempno && ndate) {
        
        CR = await GetCrewRoster(strempno, ndate);
        console.log("cr check"+CR);
 
    } else {
        CR = await GetCrewRoster(strempno, "0");
    }

    if (CR) {
        SendMSG = `${CR}\n\nThe New Spirit of Africa\nwww.ethiopianairlines.com`;
            await bot.sendMessage(chatId, `Hello ${ChatUsername}\n\n${SendMSG}`);
    } else {
        SendMSG = `\nPlease double-check your input.\n\nThe New Spirit of Africa\nwww.ethiopianairlines.com`;
          await bot.sendMessage(chatId, `Hello ${ChatUsername}\n\n${SendMSG}`);
    }
}
//handle free text
else if(messageText.startsWith('ft')){
  let  SaveFreeText = "";
  let ft = messageText.substring(2).trim();

  if(ft.length > 0){
          let ReturnCrewData =  await CrewNameAndqual(strEmpnumber);
          let Crewdetail = ReturnCrewData.split('|');
          let CrewName = Crewdetail[0];
          let CrewQual = Crewdetail[2];
          let CrewRank = Crewdetail[1] 
          let Crewphone = await ReturnPhoneNumber(chatId);
            SaveFreeText= await SaveFreeTextFromCrew(strEmpnumber ,CrewName ,Crewphone ,ft ,CrewQual ,CrewRank)
          SendMSG = `${SaveFreeText}\n\nThe New Spirit of Africa\nwww.ethiopianairlines.com`;
            await bot.sendMessage(chatId, `Hello ${ChatUsername}\n\n${SendMSG}`);
  }else{
        await bot.sendMessage(chatId, `Hello ${msg.chat.username}\n\nPlease send ft followed by your message.\n\nThe New Spirit of Africa\nwww.ethiopianairlines.com`);
  }

}

else{
let sendMsg = "";
sendMsg += "We're sorry, but we couldn't process your request. Please use the commands below:\n\n";
sendMsg += "Welcome to the bot!\n";
sendMsg += "1. Registration: \n   `Rg <Employee Primary Phone>`\n";
sendMsg += "2. Roster Request: \n   `RS <Number of Days>`\n";
sendMsg += "3. Employee Roster: \n   `ER <Employee Number>`\n";
sendMsg += "4. Crew on Board: \n   `CO <Flight Number>`\n";
sendMsg += "5. Flight Information: \n   `FN <Flight Number>`\n";
sendMsg += "6. Personal Data: \n   `PD`\n";
sendMsg += "7. Employee Phone Number: \n   `PH <Employee Number>`\n";
sendMsg += "8. Employee Email: \n   `EM <Employee Number>`\n";
sendMsg += "9. ID Replacement: \n   `IR <New ID>`\n";
sendMsg += "\nThe New Spirit of Africa\n";
sendMsg += "Visit us at: www.ethiopianairlines.com";
    bot.sendMessage(chatId, sendMsg );
  }
}); 

module.exports = router;


