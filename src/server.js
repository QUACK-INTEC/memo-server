const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const winston = require('winston');
const cors = require('cors');

const passportConfig = require('./config/passport');

winston.add(new winston.transports.Console({
    level: 'debug',
    format: winston.format.simple(),
}));

const app = express();

app.use(bodyParser.json());

app.use(passport.initialize());
app.use(passport.session());
passportConfig(passport);

app.use(cors());

app.use('/v1', require('./routes'));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    winston.error(err.stack);
    res.status(500).json({ success: false, msg: 'Something broke!' });
});

const SERVER_PORT = 3000;
app.listen(SERVER_PORT, () => {
    winston.log('info', `🚀 Server running on port ${SERVER_PORT}.`);
});

module.exports = app;
