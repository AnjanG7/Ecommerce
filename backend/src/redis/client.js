import {Redis} from "ioredis"
import logger from "../logger/winston.logger.js";

const client = new Redis(process.env.REDIS_URI)

client.on("connect",()=>{
    logger.info(
        `\n☘️  REDIS Connected! \n`
      );
})
client.on("error",()=>{
    logger.info(
        `\n☘️  REDIS Failed To Connected!!! \n`
      );

})
export {client}