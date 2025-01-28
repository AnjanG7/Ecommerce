import { Redis } from "ioredis";
import logger from "../logger/winston.logger.js";

const redisClient = new Redis(process.env.REDIS_URI);
redisClient.on("connect", () => {
  logger.info(`\n☘️  REDIS Connected! \n`);
});
redisClient.on("error", () => {
  logger.info(`\n☘️  REDIS Failed To Connected!!! \n`);
});

export { redisClient };
