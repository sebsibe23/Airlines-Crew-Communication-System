const express = require('express');
const router = express.Router();
const db = require('../config/database'); 

router.get('/', async (req, res) => {
    const query = `
        SELECT empNumber, COUNT(*) AS unread_count
        FROM freetext
        WHERE reply IS NULL
        GROUP BY empNumber
    `;

    try {
        const [rows] = await db.promise().query(query);
        
        const chats = rows.map(row => ({
            empNumber: row.empNumber,
            unread_count: row.unread_count
        }));

        res.json(chats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
