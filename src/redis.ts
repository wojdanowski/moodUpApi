import redis, { RedisClient } from 'redis';

const redisUrl: string = process.env.REDIS_URL!;
const redisPort: number = parseInt(process.env.REDIS_PORT!, 10);

const redisClient: RedisClient = redis.createClient(redisPort, redisUrl);
redisClient.on('connect', () => {
	console.log('Redis connected');
});

const getFromCache = (key: string): Promise<string | null> => {
	return new Promise((resolve, reject) => {
		redisClient.get(key, (err, res) => {
			resolve(res);
		});
	});
};
const delFromCache = (key: string): Promise<number | null> => {
	return new Promise((resolve, reject) => {
		redisClient.del(key, (err, res) => {
			resolve(res);
		});
	});
};

const setToCache = (
	key: string,
	value: string,
	option: string,
	duration: number
): Promise<string | null> => {
	return new Promise((resolve, reject) => {
		redisClient.set(key, value, option, duration, (err, res) => {
			resolve('OK');
		});
	});
};
export { redisClient, getFromCache, setToCache, delFromCache };
