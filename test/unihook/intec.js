const chai = require('chai');
const { parseSchedule, parseDiscrim } = require('../../src/unihook/intec');
const { RES_EXAMPLE_SCHEDULE, RES_EXAMPLE_DISCRIM } = require('./intec.templates');

chai.should();

describe('UniHook - INTEC', () => {
    describe('Schedule Parser', () => {
        it('should parse the main page html correctly', () => {
            const classes = parseSchedule(RES_EXAMPLE_SCHEDULE);

            classes.should.be.an('array').with.lengthOf(3);

            classes[0].should.have.property('code', 'IDS322');
            classes[0].should.have.property('section', '01');
            classes[0].should.have.property('room', 'VT1');
            classes[0].should.have.property('name', 'MANTENIMIENTO DE SOFTWARE');
            classes[0].should.have.property('professor', 'FRANCIA ODALIS MEJIA POLANCO');
            classes[0].should.have.property('schedule');

            classes[0].schedule.should.be.an('object').and.include.all.keys('monday', 'wednesday');
            classes[0].schedule.monday.should.be.an('object').and.include.all.keys('from', 'to');
            classes[0].schedule.monday.from.should.equal(9);
            classes[0].schedule.monday.to.should.equal(11);
        });

        it('should strip extra spaces from professor name', () => {
            const classes = parseSchedule(RES_EXAMPLE_SCHEDULE);
            classes[2].should.have.property('professor', 'DAVID ALEJANDRO JOA MORALES');
        });
    });

    describe('Discriminator Parser', () => {
        it('should parse the discriminator from html correctly', () => {
            const discrim = parseDiscrim(RES_EXAMPLE_DISCRIM);
            discrim.should.equal('NOVIEMBRE 2019 - ENERO 2020');
        });
    });
});
