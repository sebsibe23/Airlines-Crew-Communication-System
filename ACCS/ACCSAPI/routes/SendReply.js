const express = require('express');
const axios = require('axios');
const router = express.Router();
const db = require('../config/database');


router.post('/', async (req, res) => {
    const { empNumber, message, username } = req.body;
    console.log(username, message, empNumber);
    try {
        const result = await send_message(message, empNumber, username);
        res.send(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

async function send_message(message, empNumber, user) {
    try {
        let telegramID = "";
        let Varresponse = "";

        if (!message) {
            return { success: false, message: 'No message provided' };
        }

        // Get the max ID from freetext table
        const [maxIdResult] = await db.promise().query('SELECT MAX(id) AS max_id FROM freetext WHERE empNumber = ?', [empNumber]);
        let empNo_sequenceID = maxIdResult[0].max_id;

        // Get the Telegram chat ID
        const [tlUserName] = await db.promise().query('SELECT chatId FROM crewschedulingoffice_bot_userdetail WHERE EMPNO = ?', [empNumber]);

        if (tlUserName.length > 0) {
            telegramID = tlUserName[0].chatId;
        } else {
            telegramID = null;
        }

        // Send message via Telegram bot
        if (telegramID) {
            const botToken = '6887434002:AAEaPPWU1wfdn8fBC7hRkjkjwdo_KPQ_61o';
            const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

            try {
                const response = await axios.post(url, {
                    chat_id: telegramID,
                    text: message
                });
                Varresponse = response.data;

                // Insert the message into freetextreply
                const queryMessage = 'INSERT INTO freetextreply (empNo_sequenceID, empNumber, Reply, Repliedby, msgTimeStamp) VALUES (?, ?, ?, ?, NOW())';
                await db.promise().query(queryMessage, [empNo_sequenceID, empNumber, message, user]);

                // Update freetext table
                const updateQuery = 'UPDATE freetext SET Reply = ? WHERE id = ?';
                await db.promise().query(updateQuery, ['yes', empNo_sequenceID]);

                return { success: true, message: 'Message sent successfully' };
            } catch (error) {
                return { success: false, message: `Error sending message: ${error.message}` };
            }
        } else {
            return { success: false, message: 'No Telegram ID found' };
        }
    } catch (err) {
        return { success: false, message: err.message };
    }
}

module.exports = router;
