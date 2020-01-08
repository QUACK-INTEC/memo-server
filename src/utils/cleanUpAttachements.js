const aws = require('aws-sdk');
const { AWS_S3_BUCKET_NAME, AWS_S3_ENDPOINT } = require('../config/config');
const { UserModel, PostModel, AttachmentModel } = require('../models');

const s3 = new aws.S3({
    endpoint: new aws.Endpoint(AWS_S3_ENDPOINT),
});
const cleanUpAttachements = async () => {
    // const files = await s3.listObjects();
    const posts = await PostModel
        .find()
        .lean()
        .exec();
    const attachments = [];
    posts.forEach((p) => p.attachments.forEach((a) => attachments.push(a)));
    console.log(attachments);

    const posts = await AttachmentModel
    .find({
        
    })
    .lean()
    .exec();
    
    // const prefix = 'memo/att/';
    // const fileKey = prefix + res.body.attachments[0].fileURL.split(`/${prefix}`)[1];
    // await s3.deleteObject({ Bucket: AWS_S3_BUCKET_NAME, Key: fileKey }).promise();
};

module.exports = cleanUpAttachements;
