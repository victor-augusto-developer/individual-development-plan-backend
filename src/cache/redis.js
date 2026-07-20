import { createClient } from "redis";

let redis = null;
let initialized = false;

export async function getRedis() {

    if (initialized) {
        return redis;
    }

    initialized = true;

    try {

        if (!process.env.REDIS_URL) {
            return null;
        }

        redis = createClient({
            url: process.env.REDIS_URL
        });

        await redis.connect();

        return redis;

    } catch (err) {

        redis = null;

        return null;
    }

}