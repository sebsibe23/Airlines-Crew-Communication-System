const db = require('../config/database');
const express = require('express');
const router = express.Router();
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

router.get('/', async (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).send('Username is required');
    }

    try {
        const result = await checkBotuser(username);
        res.send({ exists: result === "YES" });
    } catch (error) {
        console.error("Error checking user:", error);
        res.status(500).send('Internal Server Error');
    }
});


module.exports = router;
module.exports.checkBotuser = checkBotuser;