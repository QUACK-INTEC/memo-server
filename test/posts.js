
const chai = require('chai');
const chaiHttp = require('chai-http');

const server = require('../');
const {
    UniversityModel,
    SubjectModel,
    SectionModel,
    UserModel,
    AttachmentModel,
    PostModel,
} = require('../src/models');

const InternalErrors = require('../src/constants/errors/InternalErrors');

chai.should();
chai.use(chaiHttp);

describe('Posts', () => {
    let authToken = false;
    let userId = false;
    let sectionId = false;

    before(async () => {
        const university = await UniversityModel.findOne({ name: 'uniprueba' });

        const subject = await new SubjectModel({
            name: 'Clase de Prueba',
            code: '101',
            university: university._id,
        }).save();

        const user = await chai.request(server).post('/v1/auth/register').send({
            firstName: 'Prueba',
            lastName: 'Prueba',
            email: 'prueba@prueba.com',
            password: 'prueba',
        });

        userId = user.body.user.id.toString();

        const section = await new SectionModel({
            subject: subject._id,
            professorName: 'Profesor Prueba',
            classRoom: 'VT',
            active: true,
            code: '101',
            students: [userId],
            schedule: {},
            discriminator: 'TEST_TRIMESTER',
        }).save();

        sectionId = section._id.toString();

        const loginRes = await chai.request(server).post('/v1/auth/login').send({
            email: 'prueba@prueba.com',
            password: 'prueba',
        });

        authToken = loginRes.body.token;
    });

    describe('EP-17 Create Posts (POST /v1/posts)', () => {
        it('should create event posts correctly', async () => {
            const postData = {
                section: sectionId,
                title: 'Publicación de prueba',
                description: 'Descripción de la publicación',
                type: 'Event',
                startDate: new Date(),
                endDate: new Date(),
                isPublic: false,
            };

            const res = await chai.request(server)
                .post('/v1/posts')
                .set('Authorization', `Bearer ${authToken}`)
                .send(postData);

            res.should.have.status(200);
            res.body.success.should.eql(true);

            const newPost = await PostModel.findById(res.body.data.id).exec();

            newPost.title.should.eql(postData.title);
            newPost.description.should.eql(postData.description);
            newPost.type.should.eql(postData.type);
            newPost.isPublic.should.eql(postData.isPublic);
            newPost.author.toString().should.eql(userId);
            newPost.startDate.should.eql(postData.startDate);
            newPost.endDate.should.eql(postData.endDate);
        });

        it('should create resource posts correctly', async () => {
            const attachment = await new AttachmentModel({
                name: 'Imagen Prueba',
                fileURL: 'https://via.placeholder.com/500',
                uploadedBy: userId,
            }).save();

            const postData = {
                section: sectionId,
                title: 'Publicación de prueba',
                description: 'Descripción de la publicación',
                type: 'Resource',
                attachments: [attachment._id],
                isPublic: false,
            };

            const res = await chai.request(server)
                .post('/v1/posts')
                .set('Authorization', `Bearer ${authToken}`)
                .send(postData);

            res.should.have.status(200);
            res.body.success.should.eql(true);

            const newPost = await PostModel.findById(res.body.data.id).exec();

            newPost.title.should.eql(postData.title);
            newPost.description.should.eql(postData.description);
            newPost.type.should.eql(postData.type);
            newPost.isPublic.should.eql(postData.isPublic);
            newPost.author.toString().should.eql(userId);
            newPost.attachments.should.be.an('array').that.includes(attachment._id);
        });

        it('should fail with missing fields (no title)', async () => {
            const res = await chai.request(server)
                .post('/v1/posts')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    section: sectionId,
                    description: 'Descripción de publicación',
                    type: 'Event',
                    startDate: new Date(),
                    endDate: new Date(),
                });


            res.should.have.status(400);
            res.body.code.should.eql(InternalErrors.missingFields);
        });
    });

    after(async () => {
        // Clear created docs
        await PostModel.deleteMany({});
        await AttachmentModel.deleteMany({});
        await SectionModel.deleteMany({});
        await SubjectModel.deleteMany({});
        await UserModel.deleteMany({});
    });
});
