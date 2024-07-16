const express = require('express');
const db = require('../config/database');
const router = express.Router();

router.post('/:user_id', (req, res) => {
  const user_id = req.params.user_id;
  const { name, username, email, privilege, AccStatus } = req.body;
  db.query('UPDATE user SET name = ?, username = ?, email = ?, UPrivilege = ?, AccStatus = ? WHERE userid = ?', [name, username, email, privilege, AccStatus, user_id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Internal server error' });
    }
    db.query('SELECT * FROM user WHERE userid = ?', [user_id], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
      }
      return res.status(200).json({ users: results });
    });
  });
});

module.exports = router;
