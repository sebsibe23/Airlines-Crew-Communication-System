const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const router = express.Router();

router.post('/', (req, res) => {
  const { username, old_password, new_password } = req.body;
  db.query('SELECT * FROM user WHERE username = ?', [username], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Internal server error' });
    }
    if (results.length > 0) {
      const user = results[0];
      if (bcrypt.compareSync(old_password, user.password)) {
        const hashed_password = bcrypt.hashSync(new_password, 10);
        db.query('UPDATE user SET password = ? WHERE username = ?', [hashed_password, username], (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Internal server error' });
          }
          return res.status(200).json({ message: 'Password updated successfully' });
        });
      } else {
        return res.status(401).json({ message: 'Incorrect old password' });
      }
    } else {
      return res.status(404).json({ message: 'User not found' });
    }
  });
});

router.post('/resetUserpassword', (req, res) => {
  const { username, new_password } = req.body;
  const hashed_password = bcrypt.hashSync(new_password, 10);
  db.query('UPDATE user SET password = ? WHERE username = ?', [hashed_password, username], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Internal server error' });
    }
    return res.status(200).json({ message: 'Password updated successfully' });
  });
});

module.exports = router;
