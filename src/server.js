const express = require('express');
const bodyParser = require('body-parser');
const winston = require('winston');
const cors = require('cors');

winston.add(new winston.transports.Console({
    level: 'debug',
    format: winston.format.simple(),
}));

const app = express();

app.use(bodyParser.json());
app.use(cors());

const SERVER_PORT = 3000;
app.listen(SERVER_PORT, () => {
    winston.log('info', `🚀 Server running on port ${SERVER_PORT}.`);
});

module.exports = app;
