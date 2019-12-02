const mongoose = require('mongoose');
const { UniversityModel } = require('../src/models');

// make sure db is loaded
require('../');

before(async () => {
    // Create test university
    await new UniversityModel({
        name: 'uniprueba',
        title: 'Universidad de Prueba',
    }).save();
});

after(async () => {
    // Delete database after all tests are done
    await mongoose.connection.db.dropDatabase();
});
