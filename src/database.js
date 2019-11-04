const mongoose = require('mongoose');

<<<<<<< HEAD
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
=======
const server = '127.0.0.1:27017'; // REPLACE WITH YOUR DB SERVER
const database = 'memo'; // REPLACE WITH YOUR DB NAME

class Database {
    constructor() {
        this.connect();
    }

    connect() {
        mongoose.connect(`mongodb://${server}/${database}`, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            })
            .then(() => {
                console.log('Database connection successful')
            })
            .catch(err => {
                console.error('Database connection error')
            })
>>>>>>> Connect to DB
    }
}

module.exports = new Database();
