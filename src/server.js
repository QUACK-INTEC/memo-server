const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const winston = require('winston');
const cors = require('cors');
const cron = require('node-cron');

const MemoError = require('./constants/errors/MemoError');
const cleanUpAttachments = require('./utils/cleanUpAttachements');

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
    if (err instanceof MemoError) {
        res.status(err.statusCode).json({ code: err.internalCode, msg: err.message });
    } else {
        winston.error(err.stack);
        res.status(500).json({ success: false, msg: 'Something broke!' });
    }
});

const SERVER_PORT = process.env.PORT || 3000;
app.listen(SERVER_PORT, () => {
    winston.log('info', `🚀 Server running on port ${SERVER_PORT}.`);
});

cleanUpAttachments();
// cron.schedule('55 19 * * 1', () => {
//     cleanUpAttachments();
// });


module.exports = app;
