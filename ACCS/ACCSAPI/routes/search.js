const express = require('express');
const db = require('../config/database');
const router = express.Router();

router.post('/', (req, res) => {
  const { search_query } = req.body;
  db.query('SELECT * FROM user WHERE username LIKE ?', [`%${search_query}%`], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Internal server error' });
    }
    if (results.length > 0) {
      return res.status(200).json({ users: results });
    } else {
      return res.status(404).json({ message: 'User not found' });
    }
  });
});

module.exports = router;
