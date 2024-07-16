const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');

app.use(bodyParser.json());

// Import routes
const loginRoute = require('./routes/login');
const searchRoute = require('./routes/search');
const resetPasswordRoute = require('./routes/resetPassword');
const updateUserRoute = require('./routes/updateUser');
const registerRoute = require('./routes/register');
const telegramBotRoute = require('./routes/telegramBot');
const getCrewOnBoardRoute = require('./routes/getCrewOnBoard'); // Import new route

// Use routes
app.use('/login', loginRoute);
app.use('/search', searchRoute);
app.use('/resetpassword', resetPasswordRoute);
app.use('/update_user', updateUserRoute);
app.use('/register', registerRoute);
app.use('/telegram_bot', telegramBotRoute);
app.use('/getCrewOnBoard', getCrewOnBoardRoute); // Use new route

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
