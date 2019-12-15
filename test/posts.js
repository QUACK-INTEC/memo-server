
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

const should = chai.should();
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

    describe('EP17 Create Posts (POST /v1/posts)', () => {
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
            newPost.author._id.toString().should.eql(userId);
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
            newPost.author._id.toString().should.eql(userId);
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
        });
    });

    describe('EP18 Update Posts', () => {
        it('should correctly update existing post', async () => {
            const originalData = {
                section: sectionId,
                title: 'Publicación de prueba',
                description: 'Descripción de la publicación',
                type: 'Resource',
                isPublic: false,
            };

            const createRes = await chai.request(server)
                .post('/v1/posts')
                .set('Authorization', `Bearer ${authToken}`)
                .send(originalData);

            const postId = createRes.body.data.id;

            const updateRes = await chai.request(server)
                .put(`/v1/posts/${postId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    ...originalData,
                    title: 'Publicación Actualizada',
                });

            updateRes.should.have.status(200);
            updateRes.body.success.should.eql(true);

            const post = await PostModel.findById(postId).exec();
            post.title.should.eql('Publicación Actualizada');
        });

        it('should not update nonexistent post', async () => {
            const updateRes = await chai.request(server)
                .put('/v1/posts/5dde198fb48188501ae61353')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    section: sectionId,
                    description: 'Descripción de la publicación',
                    type: 'Resource',
                    isPublic: false,
                    title: 'Publicación Actualizada',
                });

            updateRes.should.have.status(404);
        });
    });

    describe('EP19 Delete Posts', () => {
        it('should correctly delete existing post', async () => {
            const createRes = await chai.request(server)
                .post('/v1/posts')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    section: sectionId,
                    title: 'Publicación de prueba',
                    description: 'Descripción de la publicación',
                    type: 'Resource',
                    isPublic: false,
                });

            const postId = createRes.body.data.id;

            const deleteRes = await chai.request(server)
                .delete(`/v1/posts/${postId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send();

            deleteRes.should.have.status(200);
            deleteRes.body.success.should.eql(true);

            const post = await PostModel.findById(postId).exec();
            should.not.exist(post);
        });

        it('should not delete nonexistent post', async () => {
            const deleteRes = await chai.request(server)
                .delete('/v1/posts/5dde198fb48188501ae61353')
                .set('Authorization', `Bearer ${authToken}`)
                .send();

            deleteRes.should.have.status(404);
        });
    });

    describe('EP20 Get post details', async () => {
        it('should correctly get existing post details', async () => {
            const postData = {
                section: sectionId,
                title: 'Publicación de prueba',
                description: 'Descripción de la publicación',
                type: 'Event',
                startDate: new Date(),
                endDate: new Date(),
                isPublic: false,
            };

            const createRes = await chai.request(server)
                .post('/v1/posts')
                .set('Authorization', `Bearer ${authToken}`)
                .send(postData);

            const postId = createRes.body.data.id;
            const authorId = createRes.body.data.author.id;

            const detailsRes = await chai.request(server)
                .get(`/v1/posts/${postId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send();

            detailsRes.should.have.status(200);
            detailsRes.body.success.should.eql(true);
            detailsRes.body.data.should.be.an('object');

            const detailsData = detailsRes.body.data;

            detailsData.id.should.eql(postId);
            detailsData.author.should.be.an('object');
            detailsData.author.id.should.eql(authorId);
            detailsData.author.should.include.keys(['email', 'firstName', 'lastName', 'points']);
            detailsData.title.should.eql(postData.title);
            detailsData.description.should.eql(postData.description);
            detailsData.isPublic.should.eql(postData.isPublic);
            detailsData.comments.should.be.an('array').with.lengthOf(0);
            detailsData.attachments.should.be.an('array').with.lengthOf(0);
            detailsData.subtasks.should.be.an('array').with.lengthOf(0);
        });

        it('should error for nonexistent post', async () => {
            const detailsRes = await chai.request(server)
                .get('/v1/posts/5dde198fb48188501ae61353')
                .set('Authorization', `Bearer ${authToken}`)
                .send();

            detailsRes.should.have.status(404);
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
