const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const router = express.Router();

router.post('/', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Error: Please ensure all required fields are filled out before proceeding.' });
    }

    db.query('SELECT * FROM user WHERE username = ?', [username], (err, results) => {
        if (err) throw err;
        if (results.length === 0) {
            return res.status(400).json({ message: 'User not found' });
        }

        const user = results[0];
        if (user.AccStatus === 'locked') {
            return res.status(400).json({ message: 'Error: Your account is locked' });
        }

        if (bcrypt.compareSync(password, user.password)) {
            res.status(200).json({
                user: {
                    username: user.username,
                    name: user.name,
                    email: user.email,
                    UPrivilege: user.UPrivilege
                }
            });
        } else {
            res.status(400).json({ message: 'Error: Please enter correct username/password!' });
        }
    });
});

module.exports = router;
