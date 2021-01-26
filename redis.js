const redis = require('redis');
const { promisify } = require('util');

let redis_url = process.env.REDIS_URL;
let redis_port = process.env.REDIS_PORT;

if (process.env.NODE_ENV === 'development') {
	redis_url = '127.0.0.1';
	redis_port = 6379;
}
const redisClient = redis.createClient(redis_port, redis_url);
redisClient.on('connect', function () {
	console.log('Redis connected');
});

const getAsync = promisify(redisClient.get).bind(redisClient);
const setAsync = promisify(redisClient.set).bind(redisClient);

module.exports = {
	redisClient,
	getAsync,
	setAsync,
};
