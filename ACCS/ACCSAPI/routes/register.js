const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const router = express.Router();

router.post('/', (req, res) => {
  const { name, username, password, email, AccStatus, Privilege } = req.body;
  const hashed_password = bcrypt.hashSync(password, 10);
  db.query('INSERT INTO user (name, username, password, email, AccStatus, UPrivilege) VALUES (?, ?, ?, ?, ?, ?)', [name, username, hashed_password, email, AccStatus, Privilege], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Internal server error' });
    }
    return res.status(200).json({ message: 'User registered successfully' });
  });
});

module.exports = router;
