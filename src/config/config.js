module.exports = {
    AUTH_SECRET: process.env.AUTH_SECRET || 'TEMP_AUTH_SECRET',
    AWS_S3_BUCKET_NAME: process.env.S3_BUCKET_NAME || 'streampage',
    AWS_S3_ENDPOINT: process.env.S3_ENDPOINT || 'nyc3.digitaloceanspaces.com',
    EMAIL_ADDRESS: process.env.EMAIL_ADDRESS || '',
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || '',
    REDIS_HOST: process.env.REDIS_HOST || '127.0.0.1',
    REDIS_PORT: process.env.REDIS_PORT || '6379',
};
