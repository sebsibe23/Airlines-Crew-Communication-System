const db = require('../config/database');

async function ReturnPhoneNumber(strTEL_USERNAME) {
  try {
    console.log(strTEL_USERNAME);
    // RECID, TEL_USERNAME
    const sqlQuery = "SELECT phone FROM CrewSchedulingOffice_bot_UserDetail WHERE chatId = ? AND CrewQual NOT IN ('OTP user', 'MP user')";

    const [result] = await db.promise().query(sqlQuery, [strTEL_USERNAME]);

    if (result.length > 0) {
          console.log(result[0].phone);
      return result[0].phone;
    }
  } catch (ex) {
   console.log(`\n${ex.message}`, '');
  }
  return '';
}



module.exports.ReturnPhoneNumber = ReturnPhoneNumber;