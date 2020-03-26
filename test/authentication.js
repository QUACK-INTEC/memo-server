
const chai = require('chai');
const chaiHttp = require('chai-http');

const server = require('..');
const {
    UserModel,
} = require('../src/models');

chai.should();
chai.use(chaiHttp);

describe('Authentication', () => {
    describe('EP1 Regiter user (POST /v1/auth/register)', () => {
        const userData = {
            firstName: 'Prueba',
            lastName: 'Prueba',
            email: 'prueba@prueba.com',
            password: 'prueba',
        };
        it('should create an user correctly', async () => {
            const res = await chai.request(server).post('/v1/auth/register').send(userData);

            res.should.have.status(200);

            const user = await UserModel.findById(res.body.user.id).exec();
            user.firstName.should.eql(userData.firstName);
            user.lastName.should.eql(userData.lastName);
            user.email.should.eql(userData.email);
            user.points.should.eql(0);
        });

        it('should fail with code 400 creating an user already created', async () => {
            const res = await chai.request(server).post('/v1/auth/register').send(userData);
            res.should.have.status(400);
        });
        it('should fail with code 400 creating an user with error missing fields', async () => {
            const res = await chai.request(server).post('/v1/auth/register').send({});
            res.should.have.status(400);
        });
    });


    describe('EP2 Login user (POST /v1/auth/login)', () => {
        let token = false;

        it('should login user correctly', async () => {
            const user = {
                email: 'prueba@prueba.com',
                password: 'prueba',
            };
            const res = await chai.request(server).post('/v1/auth/login').send(user);

            token = res.body.token;
            res.should.have.status(200);
            token.should.not.eql(false);
            res.body.success.should.eql(true);
            res.body.user.email.should.eql(user.email);
        });
        it('should fail when wrong password sent', async () => {
            const user = {
                email: 'prueba@prueba.com',
                password: 'fail',
            };
            const res = await chai.request(server).post('/v1/auth/login').send(user);

            res.should.have.status(401);
        });
        it('should fail when wrong password sent', async () => {
            const user = {
                email: 'prueba2@prueba.com',
                password: 'fail',
            };
            const res = await chai.request(server).post('/v1/auth/login').send(user);

            res.should.have.status(401);
        });
        it('should fail with missing fields', async () => {
            const user = {
                email: 'prueba@prueba.com',
            };
            const res = await chai.request(server).post('/v1/auth/login').send(user);
            token = res.body.token;

            res.should.have.status(400);
        });
    });

    describe('EP4 Auth Check (POST /v1/auth/check)', () => {
        let token = false;

        it('should check token correctly', async () => {
            const user = {
                email: 'prueba@prueba.com',
                password: 'prueba',
            };
            const res = await chai.request(server).post('/v1/auth/login').send(user);

            token = res.body.token;
            const res2 = await chai.request(server).get('/v1/auth/check')
                .set('Authorization', `Bearer ${token}`);

            token.should.not.eql(false);
            res2.body.user.email.should.eql(user.email);

            res2.should.have.status(200);
        });

        it('should check token incorrectly', async () => {
            const res2 = await chai.request(server).get('/v1/auth/check')
                .set('Authorization', `Bearer ${'token'}`);

            res2.should.have.status(401);
        });
        it('should check token incorrectly because of missing token', async () => {
            const res2 = await chai.request(server).get('/v1/auth/check');

            res2.should.have.status(401);
        });
    });

    describe('EP5 Refresh token (POST /v1/auth/check)', () => {
        let token = false;

        it('should refresh token correctly', async () => {
            const user = {
                email: 'prueba@prueba.com',
                password: 'prueba',
            };
            const res = await chai.request(server).post('/v1/auth/login').send(user);

            token = res.body.token;
            const res2 = await chai.request(server).get('/v1/auth/refresh')
                .set('Authorization', `Bearer ${token}`);

            token.should.not.eql(false);
            res2.should.have.status(200);
        });

        it('should refresh token incorrectly', async () => {
            const res2 = await chai.request(server).get('/v1/auth/refresh')
                .set('Authorization', `Bearer ${'token'}`);

            res2.should.have.status(401);
        });
        it('should refresh token incorrectly because of missing token', async () => {
            const res2 = await chai.request(server).get('/v1/auth/refresh');

            res2.should.have.status(401);
        });
    });

    describe('EP30 Forgot passwod (POST /v1/auth/forgot)', () => {
        let token = false;

        it('should fail to find email', async () => {
            const res = await chai.request(server).post('/v1/auth/forgot')
                .set('Authorization', `Bearer ${token}`).send({ email: 'fdfga' });
                
            res.body.should.be.an('object');
            res.should.have.status(400);
        });
    });

    describe('EP31 OTP (POST /v1/auth/otp)', () => {
        let token = false;

        it('should not be authorized to check code', async () => {
            const res = await chai.request(server).post('/v1/auth/otp')
                .set('Authorization', `Bearer ${token}`).send({ email: 'prueba@prueba.com', password: 'as' });

            res.body.should.be.an('object');
            res.should.have.status(401);

        });
    });

    describe('EP32 OTP (POST /v1/auth/reset)', () => {

        it('should reset password sucessfully', async () => {
    
            const loginRes = await chai.request(server).post('/v1/auth/login').send({
                email: 'prueba@prueba.com',
                password: 'prueba',
            });
            let token = loginRes.body.token;

            const res = await chai.request(server).post('/v1/auth/reset')
                .set('Authorization', `Bearer ${token}`).send({ password: 'new' });

            res.body.should.be.an('object');
            res.should.have.status(200);

        });
    });

    after(async () => {
        // Clear created docs
        await UserModel.deleteMany({});
    });
});
