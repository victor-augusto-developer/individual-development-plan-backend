import { createClient } from "redis";

let redis = null;
let initialized = false;

export async function getRedis() {

    if (initialized) {
        return redis;
    }

    initialized = true;

    try {

        if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
            return null;
        }

        redis = createClient({
            url: process.env.UPSTASH_REDIS_REST_URL,
            token: process.env.UPSTASH_REDIS_REST_TOKEN
        });

        await redis.connect();

        return redis;

    } catch (err) {

        redis = null;

        return null;
    }

}