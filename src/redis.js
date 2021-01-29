const redis = require('redis');
const { promisify } = require('util');

let redis_url = process.env.REDIS_URL;
let redis_port = process.env.REDIS_PORT;

const redisClient = redis.createClient(redis_port, redis_url);
redisClient.on('connect', () => {
	console.log('Redis connected');
});

const getFromCache = promisify(redisClient.get).bind(redisClient);
const setToCache = promisify(redisClient.set).bind(redisClient);
const delFromCache = promisify(redisClient.del).bind(redisClient);

module.exports = {
	redisClient,
	getFromCache,
	setToCache,
	delFromCache,
};
