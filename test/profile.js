const chai = require('chai');
const chaiHttp = require('chai-http');

const server = require('../');
const { UserModel } = require('../src/models');

chai.should();
chai.use(chaiHttp);

describe('User Profiles', () => {
    let authToken = false;
    let userId = false;

    before(async () => {
        const registerRes = await chai.request(server).post('/v1/auth/register').send({
            firstName: 'Prueba',
            lastName: 'Prueba',
            email: 'prueba@prueba.com',
            password: 'prueba',
        });

        userId = registerRes.body.user.id;

        const loginRes = await chai.request(server).post('/v1/auth/login').send({
            email: 'prueba@prueba.com',
            password: 'prueba',
        });

        authToken = loginRes.body.token;
    });

    describe('EP13 User Profiles (GET /v1/profile/:id)', () => {
        it('should return existing user details', async () => {
            const otherUserRes = await chai.request(server).post('/v1/auth/register').send({
                firstName: 'Prueba',
                lastName: 'Prueba',
                email: 'prueba2@prueba.com',
                password: 'prueba2',
            });

            const otherUserId = otherUserRes.body.user.id;

            const res = await chai.request(server)
                .get(`/v1/profile/${otherUserId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send();

            res.should.have.status(200);
            res.body.user.should.be.an('object').with.all.keys('id', 'email', 'firstName', 'lastName', 'points');
            res.body.user.id.should.eql(otherUserId);
            res.body.user.email.should.eql('prueba2@prueba.com');
            res.body.commonClasses.should.be.an('array').lengthOf(0);
        });

        it('should return user not found', async () => {
            const res = await chai.request(server)
                .get('/v1/profile/5dc1fa9255767b13b48f89d7')
                .set('Authorization', `Bearer ${authToken}`)
                .send();

            res.should.have.status(404);
        });

        it('should fail when unauthorized', async () => {
            const res = await chai.request(server)
                .get('/v1/profile/5dc1fa9255767b13b48f89d7')
                .send();

            res.should.have.status(401);
        });
    });
    describe('EP28 Update User Profiles (PUT /v1/profile/:id)', () => {
        it('should update existing user details', async () => {
            let data = {
                firstName: 'Prueba',
                lastName: 'Prueba',
                email: 'prueba2@prueba.com',
                password: 'prueba2',
            };

            res = await chai.request(server)
                .get(`/v1/profile/${userId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send();

            res.should.have.status(200);
            res.body.user.should.be.an('object').with.all.keys('id', 'email', 'firstName', 'lastName', 'points');
            res.body.user.id.should.eql(userId);
        });

        it('should return user not found', async () => {
            const res = await chai.request(server)
                .get('/v1/profile/5dc1fa9255767b13b48f89d7')
                .set('Authorization', `Bearer ${authToken}`)
                .send();

            res.should.have.status(404);
        });
    });

    describe('EP14 Get Own Profile (GET /v1/profile)', () => {
        it('should return current user details', async () => {
            const res = await chai.request(server)
                .get('/v1/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .send();

            res.should.have.status(200);
            res.body.user.should.be.an('object').with.all.keys('id', 'email', 'firstName', 'lastName', 'points');
            res.body.user.id.should.eql(userId);
            res.body.user.email.should.eql('prueba@prueba.com');
        });

        it('should fail when unauthorized', async () => {
            const res = await chai.request(server)
                .get('/v1/profile')
                .send();

            res.should.have.status(401);
        });
    });

    after(async () => {
        // Clear created docs
        await UserModel.deleteMany({});
    });
});
