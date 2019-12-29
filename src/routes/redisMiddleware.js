const { promisify } = require('util');
const NodeCache = require('node-cache');
const redis = require('redis');
const winston = require('winston');
const asyncHandler = require('express-async-handler');

const { REDIS_HOST, REDIS_PORT } = require('../config/config.js');

const memCache = new NodeCache();
const redisClient = redis.createClient(REDIS_PORT, REDIS_HOST, {
    prefix: 'streampage-api',
});

const getAsync = promisify(redisClient.get).bind(redisClient);

let useRedis = false;

redisClient.on('error', (err) => {
    winston.error(`Redis Error ${err}`);
    useRedis = false;
});

redisClient.on('ready', () => {
    winston.info('Redis is ready!');
    useRedis = true;
});

const getCached = async (cacheKey) => {
    if (process.env.NODE_ENV !== 'production') return false;

    if (useRedis) {
        winston.debug(`Getting cache for ${cacheKey} `);
        return getAsync(cacheKey);
    }

    winston.warn(`Getting cache for ${cacheKey} - NOT USING REDIS!`);
    return memCache.get(cacheKey);
};

const updateCache = (cacheKey, content, duration) => {
    if (useRedis) {
        winston.debug(`Saving cache for ${cacheKey} `);
        redisClient.setex(cacheKey, duration, content);
        return;
    }

    winston.warn(`Saving cache for ${cacheKey} - NOT USING REDIS!`);
    memCache.set(cacheKey, content, duration);
};

const cacheMiddleware = (durationSeconds) => asyncHandler(async (req, res, next) => {
    const key = `__sp-api__${req.originalUrl}` || req.url;
    const cacheContent = await getCached(key);
    if (cacheContent) {
        res.setHeader('x-cache', 'HIT');
        res.send(cacheContent);
        return;
    }
    res.sendResponse = res.send;
    res.send = (body) => {
        updateCache(key, body, durationSeconds);
        res.setHeader('x-cache', 'MISS');
        res.sendResponse(body);
    };
    next();
});

module.exports = cacheMiddleware;
