// routes/chatDetail.js
const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', async (req, res) => {
    const { empNumber } = req.body;
    console.log(empNumber);

    try {
        const result = await GetChatdetail(empNumber);
        res.json(result); // Send the result to the client
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

async function GetChatdetail(empNumber) {
    const query = `
        SELECT id, empNumber, Name, phone, txtMsg, msgTimeStamp, sentBy, msgSentStatus, crewqual, crewcat
        FROM freetext
        WHERE empNumber = ? AND reply IS NULL
        ORDER BY msgTimeStamp ASC
    `;

    try {
        const [freetextRows] = await db.promise().query(query, [empNumber]);

        const messages = freetextRows.map(row => ({
            id: row.id,
            empNumber: row.empNumber,
            Name: row.Name,
            phone: row.phone,
            txtMsg: row.txtMsg,
            msgTimeStamp: row.msgTimeStamp,
            sentBy: row.sentBy,
            msgSentStatus: row.msgSentStatus,
            crewqual: row.crewqual,
            crewcat: row.crewcat,
            Reply: null,
            messageType: 'received'
        }));

        messages.sort((a, b) => new Date(a.msgTimeStamp) - new Date(b.msgTimeStamp));

        return messages; // Return messages to the calling function
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = router;
