import redis, { RedisClient } from 'redis';
import AppError from './utils/appError';
import { StatusCodes } from 'http-status-codes';

const redisUrl: string = process.env.REDIS_URL!;
const redisPort: number = parseInt(process.env.REDIS_PORT!, 10);

const redisClient: RedisClient = redis.createClient(redisPort, redisUrl);
redisClient.on('connect', () => {
	console.log('Redis connected');
});

const getFromCache = (key: string): Promise<string | null> => {
	return new Promise((resolve, reject) => {
		redisClient.get(key, (err, res) => {
			if (err) {
				return reject(false);
			}
			resolve(res);
		});
	});
};
const delFromCache = (key: string): Promise<number | null> => {
	return new Promise((resolve, reject) => {
		redisClient.del(key, (err, res) => {
			if (err) {
				return reject(false);
			}
			resolve(res);
		});
	});
};

const setToCache = (
	key: string,
	value: string,
	option: string,
	duration: number
): Promise<boolean> => {
	return new Promise((resolve, reject) => {
		redisClient.set(key, value, option, duration, (err, res) => {
			if (err) {
				return reject(false);
			}
			resolve(true);
		});
	});
};
export { redisClient, getFromCache, setToCache, delFromCache };
