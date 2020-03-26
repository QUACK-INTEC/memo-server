
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
    SubTaskModel,
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

    describe('EP21 Create Subtask (POST /v1/posts/:postId/subtask)', () => {
        it('should create subtask correctly', async () => {
            const postRes = await chai.request(server)
                .post('/v1/posts')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    section: sectionId,
                    title: 'Publicación de prueba',
                    description: 'Descripción de la publicación',
                    type: 'Resource',
                    isPublic: false,
                });

            const postId = postRes.body.data.id;

            const taskData = {
                name: 'Hacer la tarea',
            };

            const res = await chai.request(server)
                .post(`/v1/posts/${postId}/subtask`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(taskData);

            res.should.have.status(200);
            res.body.success.should.eql(true);

            const newTask = await SubTaskModel.findById(res.body.task.id).exec();

            newTask.name.should.eql(taskData.name);
            newTask.isDone.should.eql(false);
            newTask.author._id.toString().should.eql(userId);
            newTask.post.toString().should.eql(postId);
        });

        it('should fail for nonexistent post', async () => {
            const nonexistentPostId = '5dde198fb48188501ae61353';
            const res = await chai.request(server)
                .post(`/v1/posts/${nonexistentPostId}/subtask`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Hacer la tarea',
                });

            res.should.have.status(404);
        });
    });

    describe('EP22 Update Subtask (PUT /v1/posts/:postId/subtask/:id)', () => {
        it('should update existing subtask', async () => {
            const postRes = await chai.request(server)
                .post('/v1/posts')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    section: sectionId,
                    title: 'Publicación de prueba',
                    description: 'Descripción de la publicación',
                    type: 'Resource',
                    isPublic: false,
                });

            const postId = postRes.body.data.id;

            const taskData = {
                name: 'Hacer la tarea',
            };

            const createRes = await chai.request(server)
                .post(`/v1/posts/${postId}/subtask`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(taskData);

            const taskId = createRes.body.task.id;

            const updateRes = await chai.request(server)
                .put(`/v1/posts/${postId}/subtask/${taskId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ isDone: true });

            updateRes.should.have.status(200);

            const task = await SubTaskModel.findById(taskId).exec();
            task.isDone.should.eql(true);
        });

        it('should fail for nonexistent subtask', async () => {
            const postRes = await chai.request(server)
                .post('/v1/posts')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    section: sectionId,
                    title: 'Publicación de prueba',
                    description: 'Descripción de la publicación',
                    type: 'Resource',
                    isPublic: false,
                });

            const postId = postRes.body.data.id;

            const nonexistentTaskId = '5dde198fb48188501ae61353';
            const res = await chai.request(server)
                .put(`/v1/posts/${postId}/subtask/${nonexistentTaskId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ isDone: true });

            res.should.have.status(404);
        });
    });


    describe('EP23 Delete Subtasks (DELETE /v1/posts/:postId/subtask/:id)', () => {
        it('should correctly delete existing subtask', async () => {
            const postRes = await chai.request(server)
                .post('/v1/posts')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    section: sectionId,
                    title: 'Publicación de prueba',
                    description: 'Descripción de la publicación',
                    type: 'Resource',
                    isPublic: false,
                });

            const postId = postRes.body.data.id;

            const taskData = {
                name: 'Hacer la tarea',
            };

            const createRes = await chai.request(server)
                .post(`/v1/posts/${postId}/subtask`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(taskData);

            const taskId = createRes.body.task.id;

            const deleteRes = await chai.request(server)
                .delete(`/v1/posts/${postId}/subtask/${taskId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send();

            deleteRes.should.have.status(200);
            deleteRes.body.success.should.eql(true);

            const task = await SubTaskModel.findById(taskId).exec();
            should.not.exist(task);
        });

        it('should not delete nonexistent subtask', async () => {
            const postRes = await chai.request(server)
                .post('/v1/posts')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    section: sectionId,
                    title: 'Publicación de prueba',
                    description: 'Descripción de la publicación',
                    type: 'Resource',
                    isPublic: false,
                });

            const postId = postRes.body.data.id;

            const nonexistentTaskId = '5dde198fb48188501ae61353';
            const res = await chai.request(server)
                .delete(`/v1/posts/${postId}/subtask/${nonexistentTaskId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send();

            res.should.have.status(404);
        });
    });

    describe('EP27 Coment reaction', async () => {
        it('should upvote comment successfully', async () => {
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

            const commentData = {
                body: 'Test',
            };

            const comment = await chai.request(server)
                .post(`/v1/posts/${postId}/comment`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(commentData);

                const commentId =  comment.body.comment.id;

            const res = await chai.request(server)
                .post(`/v1/posts/comments/${commentId}/upvote`)
                .set('Authorization', `Bearer ${authToken}`)
                .send();
            res.should.have.status(200);
            res.body.success.should.eql(true);
        });
        it('should downvote comment successfully', async () => {
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

            const commentData = {
                body: 'Test',
            };

            const comment = await chai.request(server)
                .post(`/v1/posts/${postId}/comment`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(commentData);

                const commentId =  comment.body.comment.id;

            const res = await chai.request(server)
                .post(`/v1/posts/comments/${commentId}/downvote`)
                .set('Authorization', `Bearer ${authToken}`)
                .send();
            res.body.success.should.eql(true);
        });
        it('should reset comment successfully', async () => {
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

            const commentData = {
                body: 'Test',
            };

            const comment = await chai.request(server)
                .post(`/v1/posts/${postId}/comment`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(commentData);
            const commentId =  comment.body.comment.id;

            const res = await chai.request(server)
                .post(`/v1/posts/comments/${commentId}/resetvote`)
                .set('Authorization', `Bearer ${authToken}`)
                .send();
            res.body.success.should.eql(true);
        });
    });
    


    describe('EP24 Create Comment (POST /v1/posts/:postId/comment)', () => {
        it('should create comment correctly', async () => {
            const postRes = await chai.request(server)
                .post('/v1/posts')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    section: sectionId,
                    title: 'Publicación de prueba',
                    description: 'Descripción de la publicación',
                    type: 'Resource',
                    isPublic: false,
                });

            const postId = postRes.body.data.id;

            const commentData = {
                body: 'Comentario de Prueba',
            };

            const res = await chai.request(server)
                .post(`/v1/posts/${postId}/comment`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(commentData);

            res.should.have.status(200);
            res.body.success.should.eql(true);

            const post = await PostModel.findById(postId).exec();
            const newComment = post.comments.id(res.body.comment.id);

            newComment.body.should.eql(commentData.body);
            newComment.author._id.toString().should.eql(userId);
        });

        it('should fail for nonexistent post', async () => {
            const nonexistentPostId = '5dde198fb48188501ae61353';
            const res = await chai.request(server)
                .post(`/v1/posts/${nonexistentPostId}/comment`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    body: 'Comentario de Prueba',
                });

            res.should.have.status(404);
        });
    });

    describe('EP29 Get events', async () => {
        it('should correctly get events for today details', async () => {
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

            const res = await chai.request(server)
                .get(`/v1/posts/${postId}/events`)
                .set('Authorization', `Bearer ${authToken}`)
                .send();


            res.should.have.status(404);
            res.body.should.eql({});
        });

        it('should error for nonexistent post', async () => {
            const detailsRes = await chai.request(server)
                .get('/v1/posts/5dde198fb48188501ae61353')
                .set('Authorization', `Bearer ${authToken}`)
                .send();

            detailsRes.should.have.status(404);
        });
    });

    describe('EP25 Delete Comments (DELETE /v1/posts/:postId/comment/:id)', () => {
        it('should correctly delete existing comments', async () => {
            const postRes = await chai.request(server)
                .post('/v1/posts')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    section: sectionId,
                    title: 'Publicación de prueba',
                    description: 'Descripción de la publicación',
                    type: 'Resource',
                    isPublic: false,
                });

            const postId = postRes.body.data.id;

            const createRes = await chai.request(server)
                .post(`/v1/posts/${postId}/comment`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    body: 'Comentario de Prueba',
                });


            const commentId = createRes.body.comment.id;

            const res = await chai.request(server)
                .delete(`/v1/posts/${postId}/comment/${commentId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send();

            res.should.have.status(200);
            res.body.success.should.eql(true);

            const post = await PostModel.findById(postId).exec();
            const comment = post.comments.id(commentId);
            should.not.exist(comment);
        });

        it('should fail deleting nonexistent comment', async () => {
            const postRes = await chai.request(server)
                .post('/v1/posts')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    section: sectionId,
                    title: 'Publicación de prueba',
                    description: 'Descripción de la publicación',
                    type: 'Resource',
                    isPublic: false,
                });

            const postId = postRes.body.data.id;

            const nonexistentCommentId = '5dde198fb48188501ae61353';
            const res = await chai.request(server)
                .delete(`/v1/posts/${postId}/comment/${nonexistentCommentId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send();

            res.should.have.status(404);
        });
    });

    describe('EP26 - Post Reactions', () => {
        const totalReactions = (total, current) => total + current.value;
        let postId = false;

        beforeEach(async () => {
            const postRes = await chai.request(server)
                .post('/v1/posts')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    section: sectionId,
                    title: 'Publicación de prueba',
                    description: 'Descripción de la publicación',
                    type: 'Resource',
                    isPublic: false,
                });

            postId = postRes.body.data.id;
        });

        afterEach(async () => {
            await chai.request(server).delete(`/v1/posts/${postId}`).set('Authorization', `Bearer ${authToken}`).send();
        });

        it('should upvote post correctly', async () => {
            const res = await chai.request(server)
                .post(`/v1/posts/${postId}/upvote`)
                .set('Authorization', `Bearer ${authToken}`)
                .send();

            res.should.have.status(200);
            res.body.success.should.eql(true);

            const post = await PostModel.findById(postId).lean().exec();
            const score = post.reactions ? post.reactions.reduce(totalReactions, 0) : 0;

            score.should.eql(1);
        });

        it('should downvote post correctly', async () => {
            const res = await chai.request(server)
                .post(`/v1/posts/${postId}/downvote`)
                .set('Authorization', `Bearer ${authToken}`)
                .send();

            res.should.have.status(200);
            res.body.success.should.eql(true);

            const post = await PostModel.findById(postId).lean().exec();
            const score = post.reactions ? post.reactions.reduce(totalReactions, 0) : 0;

            score.should.eql(-1);
        });

        it('should reset post reaction correctly', async () => {
            await chai.request(server)
                .post(`/v1/posts/${postId}/upvote`)
                .set('Authorization', `Bearer ${authToken}`)
                .send();

            const res = await chai.request(server)
                .post(`/v1/posts/${postId}/resetvote`)
                .set('Authorization', `Bearer ${authToken}`)
                .send();

            res.should.have.status(200);
            res.body.success.should.eql(true);

            const post = await PostModel.findById(postId).lean().exec();
            const score = post.reactions ? post.reactions.reduce(totalReactions, 0) : 0;

            score.should.eql(0);
        });
    });

    after(async () => {
        // Clear created docs
        await SubTaskModel.deleteMany({});
        await PostModel.deleteMany({});
        await AttachmentModel.deleteMany({});
        await SectionModel.deleteMany({});
        await SubjectModel.deleteMany({});
        await UserModel.deleteMany({});
    });
});
