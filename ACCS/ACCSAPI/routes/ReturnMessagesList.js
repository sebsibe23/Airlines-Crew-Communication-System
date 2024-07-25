const express = require('express');
const router = express.Router();
const db = require('../config/database'); 

router.get('/', (req, res) => {
    const { empNumber } = req.body;

    const queryFreetext = `
        SELECT id, empNumber, Name, phone, txtMsg, msgTimeStamp, sentBy, msgSentStatus, crewqual, crewcat
        FROM freetext
        WHERE empNumber = ?
        ORDER BY msgTimeStamp ASC
    `;

    const queryFreetextReply = `
        SELECT id, empNumber, msgTimeStamp, Reply, Repliedby, empNo_sequenceID
        FROM freetextreply
        WHERE empNumber = ?
        ORDER BY msgTimeStamp ASC
    `;

    db.promise().query(queryFreetext, [empNumber])
        .then(([freetextRows]) => {
            return db.promise().query(queryFreetextReply, [empNumber])
                .then(([freetextReplyRows]) => ({ freetextRows, freetextReplyRows }));
        })
        .then(({ freetextRows, freetextReplyRows }) => {
            let messages = [];

            freetextRows.forEach(row => {
                messages.push({
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
                });
            });

            freetextReplyRows.forEach(row => {
                messages.push({
                    id: row.id,
                    empNumber: row.empNumber,
                    txtMsg: row.Reply,
                    msgTimeStamp: row.msgTimeStamp,
                    sentBy: row.Repliedby,
                    msgSentStatus: 'Replied',
                    Reply: row.Reply,
                    Repliedby: row.Repliedby,
                    messageType: 'sent'
                });
            });

            messages.sort((a, b) => new Date(a.msgTimeStamp) - new Date(b.msgTimeStamp));

            res.json(messages);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err.message });
        });
});

module.exports = router;
