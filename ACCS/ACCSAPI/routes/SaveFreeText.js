const axios = require('axios');
const sql = require('mssql');
const db = require('../config/database');

async function SaveFreeTextFromCrew(VarempNumber, VarName, Varphone, VartxtMsg, Varcrewqual, Varcrewcat) {
  console.log(VarempNumber, VarName, Varphone, VartxtMsg, Varcrewqual, Varcrewcat);
  let SendMSG = "";
  try {
    const connection = db;
    await new Promise((resolve, reject) => {
      db.query('INSERT INTO FreeText (empNumber, Name, phone, txtMsg, crewqual, crewcat, msgTimeStamp) VALUES (?, ?, ?, ?, ?, ?, ?)', [
        VarempNumber,
        VarName,
        Varphone,
        VartxtMsg,
        Varcrewqual,
        Varcrewcat,
        new Date()
      ], (err) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          SendMSG = `
Message successfully delivered to the Crew Back Office.

If you have requested EML, please ensure you have specified the number of days required.

---

**The New Spirit of Africa**

[www.ethiopianairlines.com](http://www.ethiopianairlines.com)
`;
          resolve();
        }
      });
    });
  } catch (error) {
    console.error('Error occurred:', error);
    throw error;
  }
  console.log(SendMSG);
  return SendMSG;
}


module.exports.SaveFreeTextFromCrew = SaveFreeTextFromCrew;
