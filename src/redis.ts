import redis, { RedisClient } from 'redis';

const redisUrl: string = <string>process.env.REDIS_URL;
const redisPort: number = parseInt(<string>process.env.REDIS_PORT, 10);
const redisPWD: string = <string>process.env.REDIS_PWD;

const redisClient: RedisClient = redis.createClient({ port: redisPort, host: redisUrl, password: redisPWD });

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

const setToCache = (key: string, value: string, option: string, duration: number): Promise<boolean> => {
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
