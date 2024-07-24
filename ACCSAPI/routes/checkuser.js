const db = require('../config/database');

async function checkBotuser(user_name) {
  try {
    const [rows, fields] = await db.promise().query(`SELECT TEL_USERNAME FROM CrewSchedulingOffice_bot_UserDetail WHERE chatId = '${user_name}'`);

    if (rows.length > 0) {
      return "YES";
    }
    return "NO";
  } catch (ex) {

    console.log(`\n${ex.message}`, "");
    return "NO";
  }
}


module.exports.checkBotuser = checkBotuser;