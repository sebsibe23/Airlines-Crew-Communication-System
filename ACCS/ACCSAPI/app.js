const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3001;

app.use(bodyParser.json());

// Import routes
const loginRoute = require('./routes/login');
const searchRoute = require('./routes/search');
const resetPasswordRoute = require('./routes/resetPassword');
const updateUserRoute = require('./routes/updateUser');
const registerRoute = require('./routes/register');
const telegramBotRoute = require('./routes/telegramBot');
const crewOnBoardRoute = require('./routes/crewOnBoard');
const crewEmailRoute = require('./routes/GetCrewEmail');
const GetEmpCurrentStatusRoute = require('./routes/GetEmpCurrentStatus');
const getCrewRosterRoute = require('./routes/GetEmployeeRoster');
const getCrewPersonalDateRoute = require('./routes/ReturnCrewBasicData');
const getFlightScheduleRoute = require('./routes/GetFlightInfo'); 
const GetEmpPhoneRoute =require('./routes/GetCrewPhone'); 
const CheckTelegramuserRoute = require('./routes/checTkuser');
const GetemploynumberwithtelegramIDroute = require('./routes/empnumreturnfromLDB');
const GetemployphonewithtelegramIDroute = require('./routes/EmpreturnPhoneLDB');
const SmsGatewayroute = require('./routes/smsGateway');
const sendMessageRoute = require('./routes/SendReply');
const chatDetailRoute = require('./routes/chatDetail');
const messagesRoute = require('./routes/ReturnMessagesList');
const UnrepliedchatCountRoute = require('./routes/UnrepliedchatCount');
// Use routes
app.use('/login', loginRoute);
app.use('/search', searchRoute);
app.use('/resetpassword', resetPasswordRoute);
app.use('/update_user', updateUserRoute);
app.use('/register', registerRoute);
app.use('/telegram_bot', telegramBotRoute);
app.use('/crew_on_board', crewOnBoardRoute); 
app.use('/crewEmail', crewEmailRoute); 
app.use('/getEmpStatus', GetEmpCurrentStatusRoute); 
app.use('/getCrewRoster', getCrewRosterRoute);
app.use('/getCrewPersonal', getCrewPersonalDateRoute);
app.use('/getCrewPhone', GetEmpPhoneRoute);
app.use('/getFlightSchedule', getFlightScheduleRoute);
app.use('/CheckTelegramuser', CheckTelegramuserRoute);
app.use('/GetemploynumberwithtelegramID', GetemploynumberwithtelegramIDroute);
app.use('/GetemployphonewithtelegramID', GetemployphonewithtelegramIDroute);
app.use('/SendSmsGateway', SmsGatewayroute);
app.use('/sendMessage', sendMessageRoute);
app.use('/ChatDetail', chatDetailRoute);
app.use('/messages', messagesRoute);
app.use('/UnrepliedCrewchatCount', UnrepliedchatCountRoute);
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app; 