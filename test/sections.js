
const chai = require('chai');
const chaiHttp = require('chai-http');

const server = require('../');
const {
    UniversityModel,
    SubjectModel,
    SectionModel,
    UserModel,
} = require('../src/models');

chai.should();
chai.use(chaiHttp);

describe('Sections', () => {
    let authToken = false;
    let userId = false;
    let university = false;

    before(async () => {
        university = await UniversityModel.findOne({ name: 'uniprueba' });

        const user = await chai.request(server).post('/v1/auth/register').send({
            firstName: 'Prueba',
            lastName: 'Prueba',
            email: 'prueba@prueba.com',
            password: 'prueba',
        });

        userId = user.body.user.id.toString();

        const loginRes = await chai.request(server).post('/v1/auth/login').send({
            email: 'prueba@prueba.com',
            password: 'prueba',
        });

        authToken = loginRes.body.token;
    });

    describe('EP6 My classes (GET /v1/sections)', () => {
        it('should get user classes', async () => {
            const subject1 = await new SubjectModel({
                name: 'Clase de Prueba',
                code: '101',
                university: university._id,
            }).save();

            const section1 = await new SectionModel({
                subject: subject1._id,
                professorName: 'Profesor Prueba',
                classRoom: 'VT',
                active: true,
                code: '101',
                students: [userId],
                schedule: {},
                discriminator: 'TEST_TRIMESTER',
            }).save();

            const subject2 = await new SubjectModel({
                name: 'Clase de Prueba 2',
                code: '102',
                university: university._id,
            }).save();

            const section2 = await new SectionModel({
                subject: subject2._id,
                professorName: 'Profesor Prueba 2',
                classRoom: 'VT',
                active: true,
                code: '102',
                students: [userId],
                schedule: {},
                discriminator: 'TEST_TRIMESTER',
            }).save();

            const res = await chai.request(server)
                .get('/v1/sections')
                .set('Authorization', `Bearer ${authToken}`)
                .send();

            res.should.have.status(200);
            res.body.success.should.eql(true);
            res.body.data.should.be.an('array').lengthOf(2);

            const sectionIds = res.body.data.map((sect) => sect.id);
            sectionIds.should.include(section1._id.toString(), section2._id.toString());

            // Cleanup classes
            await SubjectModel.deleteMany({});
            await SectionModel.deleteMany({});
        });

        it('should get no classes', async () => {
            const res = await chai.request(server)
                .get('/v1/sections')
                .set('Authorization', `Bearer ${authToken}`)
                .send();

            res.should.have.status(200);
            res.body.success.should.eql(true);
            res.body.data.should.be.an('array').lengthOf(0);
        });

        it('should only get active classes', async () => {
            const subject1 = await new SubjectModel({
                name: 'Clase de Prueba',
                code: '101',
                university: university._id,
            }).save();

            const section1 = await new SectionModel({
                subject: subject1._id,
                professorName: 'Profesor Prueba',
                classRoom: 'VT',
                active: true,
                code: '101',
                students: [userId],
                schedule: {},
                discriminator: 'TEST_TRIMESTER',
            }).save();

            const subject2 = await new SubjectModel({
                name: 'Clase de Prueba 2',
                code: '102',
                university: university._id,
            }).save();

            await new SectionModel({
                subject: subject2._id,
                professorName: 'Profesor Prueba 2',
                classRoom: 'VT',
                active: false,
                code: '102',
                students: [userId],
                schedule: {},
                discriminator: 'TEST_TRIMESTER',
            }).save();

            const res = await chai.request(server)
                .get('/v1/sections')
                .set('Authorization', `Bearer ${authToken}`)
                .send();

            res.should.have.status(200);
            res.body.success.should.eql(true);
            res.body.data.should.be.an('array').lengthOf(1);

            const sectionIds = res.body.data.map((sect) => sect.id);
            sectionIds.should.include(section1._id.toString());

            // Cleanup classes
            await SubjectModel.deleteMany({});
            await SectionModel.deleteMany({});
        });

        it('should fail when unauthorized', async () => {
            const res = await chai.request(server)
                .get('/v1/sections')
                .send();

            res.should.have.status(401);
        });
    });

    after(async () => {
        // Clear created docs
        await UserModel.deleteMany({});
    });
});
