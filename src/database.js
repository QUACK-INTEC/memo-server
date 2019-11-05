const mongoose = require('mongoose');

class Database {
    constructor() {
        this.server = '127.0.0.1:27017'; // REPLACE WITH YOUR DB SERVER
        this.database = 'memo'; // REPLACE WITH YOUR DB NAME
        this.connect();
    }


    connect() {
        mongoose.connect(`mongodb://${this.server}/${this.database}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
            .then(() => {
                console.log('Database connection successful');
            })
            .catch(() => {
                console.error('Database connection error');
            });
    }
}

module.exports = new Database();
