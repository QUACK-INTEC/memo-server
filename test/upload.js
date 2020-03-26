const fs = require('fs');
const path = require('path');
const chai = require('chai');
const chaiHttp = require('chai-http');
const aws = require('aws-sdk');

const server = require('../');
const { UserModel, AttachmentModel } = require('../src/models');

const { AWS_S3_BUCKET_NAME, AWS_S3_ENDPOINT } = require('../src/config/config');

const s3 = new aws.S3({
    endpoint: new aws.Endpoint(AWS_S3_ENDPOINT),
});

chai.should();
chai.use(chaiHttp);

describe('File Uploads', () => {
    let authToken = false;
    let userId = false;

    const testFile = fs.readFileSync(path.resolve(__dirname, './testFile.png'));

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

    describe('EP15 Upload attachments (POST /v1/upload/attachments)', () => {
        it('should upload attachment file correctly', async () => {
            const res = await chai.request(server)
                .post('/v1/upload/attachments')
                .set('Authorization', `Bearer ${authToken}`)
                .attach('files', testFile, 'testFile.png')
                .field('names', 'ImagenPrueba');

            res.should.have.status(200);
            res.body.success.should.eql(true);
            res.body.attachments.should.be.an('array').with.lengthOf(1);
            res.body.attachments[0].should.be.an('object').with.all.keys('id', 'fileURL', 'name', 'uploadedBy');
            res.body.attachments[0].name.should.eql('ImagenPrueba');

            // REMOVE FROM S3 (CLEANUP)
            const prefix = 'memo/att/';
            const fileKey = prefix + res.body.attachments[0].fileURL.split(`/${prefix}`)[1];
            await s3.deleteObject({ Bucket: AWS_S3_BUCKET_NAME, Key: fileKey }).promise();
        }).timeout(45000);

        it('should fail with missing fields', async () => {
            const res = await chai.request(server)
                .post('/v1/upload/attachments')
                .set('Authorization', `Bearer ${authToken}`)
                .send();

            res.should.have.status(400);
        });

        it('should fail when unauthorized', async () => {
            const res = await chai.request(server)
                .post('/v1/upload/attachments')
                .attach('files', testFile, 'testFile.png')
                .field('names', 'ImagenPrueba');

            res.should.have.status(401);
        });
    });

    describe('EP16 Upload Profile Image (POST /v1/upload/profile)', () => {
        it('should upload and update profile image correctly', async () => {
            const res = await chai.request(server)
                .post('/v1/upload/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .attach('file', testFile, 'testFile.png');

            res.should.have.status(200);
            res.body.success.should.eql(true);
            res.body.data.should.be.an('object');
            res.body.data.id.should.eql(userId);
            res.body.data.avatarURL.should.be.a('string');

            // REMOVE FROM S3 (CLEANUP)
            const prefix = 'memo/profile/';
            const fileKey = prefix + res.body.data.avatarURL.split(`/${prefix}`)[1];
            await s3.deleteObject({ Bucket: AWS_S3_BUCKET_NAME, Key: fileKey }).promise();
        }).timeout(45000);

        it('should fail with missing fields', async () => {
            const res = await chai.request(server)
                .post('/v1/upload/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .send();

            res.should.have.status(400);
        });

        it('should fail when unauthorized', async () => {
            const res = await chai.request(server)
                .post('/v1/upload/profile')
                .attach('file', testFile, 'testFile.png');

            res.should.have.status(401);
        });
    });

    after(async () => {
        // Clear created docs
        await AttachmentModel.deleteMany({});
        await UserModel.deleteMany({});
    });
});
