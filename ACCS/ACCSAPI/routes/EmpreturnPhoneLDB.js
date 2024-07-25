const db = require('../config/database');
const express = require('express');
const router = express.Router();

async function ReturnPhoneNumber(strTEL_USERNAME) {
  try {
    console.log(`Fetching phone number for chatId: ${strTEL_USERNAME}`);
    
    const sqlQuery = "SELECT phone FROM crewschedulingoffice_bot_userdetail WHERE chatId = ? AND CrewQual NOT IN ('OTP user', 'MP user')";
    const [rows] = await db.promise().query(sqlQuery, [strTEL_USERNAME]);
    
    if (rows.length > 0) {
      console.log(`Phone number found: ${rows[0].phone}`);
      return rows[0].phone;
    } else {
      console.log(`No phone number found for chatId: ${strTEL_USERNAME}`);
    }
  } catch (ex) {
    console.error(`Error fetching phone number: ${ex.message}`);
  }
  return ''; 
}


router.get('/', async (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).send('Username is required');
    }

    try {
        const phone = await ReturnPhoneNumber(username);
        if (phone) {
            res.send({ phone });
        } else {
            res.status(404).send('Phone number not found');
        }
    } catch (error) {
        console.error("Error retrieving phone number:", error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
module.exports.ReturnPhoneNumber = ReturnPhoneNumber;