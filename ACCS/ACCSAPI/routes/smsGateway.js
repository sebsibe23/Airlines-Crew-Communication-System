// routes/smsRoutes.js
const express = require('express');
const axios = require('axios');
const os = require('os');
const router = express.Router();

const smsGatewayURL = "http://10.0.231.93:13013/cgi-bin/sendsms";
const username = "123";
const password = "123";

async function SEND(phone, message) {
    if (!message) {
        throw new Error("Please write a text to be sent");
    }

    if (!phone) {
        throw new Error("Please provide a phone number");
    }

    const myIP = Object.values(os.networkInterfaces()).flat().find(details => details.family === 'IPv4' && !details.internal).address;

    try {
        const messageId = new Date().toISOString().replace(/[-:.TZ]/g, "") + phone.replace('+', '');
        const sidname = os.userInfo().username;

        let sendMessage = encodeURIComponent(message);

        const url = `${smsGatewayURL}?username=${username}&password=${password}&charset=utf-8&coding=2&to=${phone}&text=${sendMessage}&dlr-mask=1&dlr-url=http://10.0.227.58:3001/api/ApiDlrOthBlkSMS/GetDeliveryReportOthBLKSMS?myID=${messageId}`;

        await axios.get(url)
            .then(() => {
                console.log(`Message sent to ${phone}`);
                return { message: "Successfully sent!" };
            })
            .catch((err) => {
                console.error(`Failed to send message to ${phone}:`, err);
                throw new Error("Internal server error");
            });

    } catch (err) {
        console.error('Failed to send message:', err);
        throw new Error("Internal server error");
    }
}

router.post('/', async (req, res) => {
    const { phone, message } = req.body;

    try {
        const result = await SEND(phone, message);
        res.send(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
module.exports.SEND = SEND;
