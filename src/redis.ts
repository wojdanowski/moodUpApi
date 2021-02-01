import redis, { RedisClient, Callback } from 'redis';
import { promisify } from 'util';

const redis_url: string = process.env.REDIS_URL!;
const redis_port: number = parseInt(process.env.REDIS_PORT!);

const redisClient: RedisClient = redis.createClient(redis_port, redis_url);
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
