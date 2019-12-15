module.exports = {
    AUTH_SECRET: process.env.AUTH_SECRET || 'TEMP_AUTH_SECRET',
    AWS_S3_BUCKET_NAME: process.env.S3_BUCKET_NAME || 'streampage',
    AWS_S3_ENDPOINT: process.env.S3_ENDPOINT || 'nyc3.digitaloceanspaces.com',
    EMAIL_ADDRESS: process.env.EMAIL_ADDRESS || '',
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || '',
};
