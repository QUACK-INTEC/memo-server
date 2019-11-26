const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const winston = require('winston');

const { AWS_S3_BUCKET_NAME, AWS_S3_ENDPOINT } = require('../config/config');

const InvalidFieldError = require('../constants/errors/InvalidFieldError');

const s3 = new aws.S3({
    endpoint: new aws.Endpoint(AWS_S3_ENDPOINT),
});

const uploadAtt = multer({
    storage: multerS3({
        s3,
        bucket: AWS_S3_BUCKET_NAME,
        acl: 'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: (req, file, cb) => {
            cb(null, { uploadedBy: req.user.id.toString() });
        },
        key: (req, file, cb) => {
            cb(null, `memo/att/${Date.now().toString()}_${file.originalname}`);
        },
    }),
}).array('files');

const uploadProfile = multer({
    storage: multerS3({
        s3,
        bucket: AWS_S3_BUCKET_NAME,
        acl: 'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: (req, file, cb) => {
            cb(null, { uploadedBy: req.user.id.toString() });
        },
        key: (req, file, cb) => {
            cb(null, `memo/profile/${req.user.id}`);
        },
    }),
    fileFilter: (req, file, cb) => {
        if (!file.originalname.toLower().match(/\.(jpg|jpeg|png|gif)$/)) {
            winston.log('error', `Non-matching filename: ${file.originalname}`);
            cb(new InvalidFieldError('Solo puede subir archivos de imagen como foto de perfil'));
        } else {
            cb(null, true);
        }
    },
}).single('file');

module.exports = {
    uploadAtt,
    uploadProfile,
};
