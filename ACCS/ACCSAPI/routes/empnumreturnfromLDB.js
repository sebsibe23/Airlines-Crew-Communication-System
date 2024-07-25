const db = require('../config/database');
const express = require('express');
const router = express.Router();

async function empnoreturn(strTEL_USERNAME) {
  try {
    console.log(`Fetching EMPNO for chatId: ${strTEL_USERNAME}`);
    const sqlQuery = "SELECT EMPNO FROM CrewSchedulingOffice_bot_UserDetail WHERE chatId = ? AND CrewQual NOT IN ('OTP user', 'MP user')";
    

    const [rows] = await db.promise().query(sqlQuery, [strTEL_USERNAME]);
    
    if (rows.length > 0) {
      console.log(`EMPNO found: ${rows[0].EMPNO}`);
      return rows[0].EMPNO;
    } else {
      console.log(`No EMPNO found for chatId: ${strTEL_USERNAME}`);
    }
  } catch (ex) {
    console.error(`Error fetching EMPNO: ${ex.message}`);
  }

}


router.get('/', async (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).send('Username is required');
    }

    try {
        const empNo = await empnoreturn(username);
        if (empNo) {
            res.send({ empNo });
        } else {
            res.status(404).send('Employee number not found');
        }
    } catch (error) {
        console.error("Error retrieving employee number:", error);
        res.status(500).send('Internal Server Error');
    }
});



module.exports = router;
module.exports.empnoreturn = empnoreturn;