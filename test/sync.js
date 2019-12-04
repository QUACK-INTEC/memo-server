const chai = require('chai');
const chaiHttp = require('chai-http');

const server = require('../');
const { UserModel } = require('../src/models');

chai.should();
chai.use(chaiHttp);

describe('Sync', () => {
    let authToken = false;

    before(async () => {
        await chai.request(server).post('/v1/auth/register').send({
            firstName: 'Prueba',
            lastName: 'Prueba',
            email: 'prueba@prueba.com',
            password: 'prueba',
        });

        const loginRes = await chai.request(server).post('/v1/auth/login').send({
            email: 'prueba@prueba.com',
            password: 'prueba',
        });

        authToken = loginRes.body.token;
    });

    describe('EP11 University Sync (POST /v1/sync)', () => {
        it('should fail with invalid credentials', async () => {
            const res = await chai.request(server)
                .post('/v1/sync')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    university: 'intec',
                    username: 'abcd',
                    password: 'efgh',
                });

            res.should.have.status(400);
        });

        it('should fail with unsupported university', async () => {
            const res = await chai.request(server)
                .post('/v1/sync')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    university: 'ijkl',
                    username: 'abcd',
                    password: 'efgh',
                });

            res.should.have.status(400);
        });

        it('should fail when unauthorized', async () => {
            const res = await chai.request(server)
                .post('/v1/sync')
                .send({
                    university: 'intec',
                    username: 'abcd',
                    password: 'efgh',
                });

            res.should.have.status(401);
        });

        it('should fail with missing fields', async () => {
            const res = await chai.request(server)
                .post('/v1/sync')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    username: 'abcd',
                    password: 'efgh',
                });

            res.should.have.status(400);
        });
    });

    describe('EP12 Supported Universities (GET /v1/sync/universities)', () => {
        it('should return supported universities', async () => {
            const res = await chai.request(server)
                .get('/v1/sync/universities')
                .set('Authorization', `Bearer ${authToken}`)
                .send();

            res.should.have.status(200);
            res.body.universities.should.be.an('array').with.lengthOf(1);
            res.body.universities[0].should.be.an('object').with.keys('id', 'title', 'syncCode');
            res.body.universities[0].syncCode.should.eql('uniprueba');
        });

        it('should fail when unauthorized', async () => {
            const res = await chai.request(server)
                .get('/v1/sync/universities')
                .send();

            res.should.have.status(401);
        });
    });

    after(async () => {
        // Clear created docs
        await UserModel.deleteMany({});
    });
});
