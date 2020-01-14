const aws = require('aws-sdk');
const { AWS_S3_BUCKET_NAME, AWS_S3_ENDPOINT } = require('../config/config');
const { PostModel, AttachmentModel } = require('../models');

const s3 = new aws.S3({
    endpoint: new aws.Endpoint(AWS_S3_ENDPOINT),
});
const cleanUpAttachements = async () => {
    // const files = await s3.listObjects();
    const posts = await PostModel
        .find()
        .lean()
        .exec();
    const attachmentsOfPosts = [];
    posts.forEach((p) => p.attachments.forEach((a) => attachmentsOfPosts.push(String(a))));

    const attachments = await AttachmentModel.find().lean().exec();

    const attachmentsToDelete = [];
    const attachmentsToDeleteId = [];
    attachments.forEach((a) => {
        if (!attachmentsOfPosts.includes(String(a._id))) {
            attachmentsToDelete.push(a);
            attachmentsToDeleteId.push(String(a._id));
        }
    });
    await AttachmentModel.deleteMany({ _id: { $in: attachmentsToDeleteId } });

    // Delete from aws
    const prefix = 'memo/att/';
    attachmentsToDelete.forEach(async (a) => {
        const fileKey = prefix + a.fileURL.split(`/${prefix}`)[1];
        await s3.deleteObject({ Bucket: AWS_S3_BUCKET_NAME, Key: fileKey }).promise();
    });
};

module.exports = cleanUpAttachements;
