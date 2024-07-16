const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');

app.use(bodyParser.json());

// Import routes
const loginRoute = require('./routes/login');


// Use routes
app.use('/login', loginRoute);


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
