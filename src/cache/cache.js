import memoryCache from "./memoryCache.js";
import { getRedis } from "./redis.js";

async function get(key) {

    const redis = await getRedis();

    if (redis?.isReady) {
        try {

            const value = await redis.get(key);

            if (value !== null) {
                return JSON.parse(value);
            }

        } catch (err) {
            console.warn("Falha ao buscar no Redis. Utilizando memória.");
        }
    }

    return memoryCache.get(key);
}

async function set(key, value, ttl = 300) {

    const redis = await getRedis();

    if (redis?.isReady) {
        try {

            await redis.set(
                key,
                JSON.stringify(value),
                {
                    EX: ttl
                }
            );

        } catch (err) {
            console.warn("Falha ao salvar no Redis. Utilizando memória.");
        }
    }

    memoryCache.set(key, value, ttl);
}

async function del(key) {

    const redis = await getRedis();

    if (redis?.isReady) {
        try {
            await redis.del(key);
        } catch (err) {
            console.warn("Falha ao remover do Redis.");
        }
    }

    memoryCache.del(key);
}

async function has(key) {

    const redis = await getRedis();

    if (redis?.isReady) {
        try {
            return (await redis.exists(key)) === 1;
        } catch (err) {
            console.warn("Falha ao verificar chave no Redis.");
        }
    }

    return memoryCache.has(key);
}

async function flush() {

    const redis = await getRedis();

    if (redis?.isReady) {
        try {
            await redis.flushAll();
        } catch (err) {
            console.warn("Falha ao limpar Redis.");
        }
    }

    memoryCache.flushAll();
}

async function remember(key, ttl, callback) {

    const cached = await get(key);

    if (cached !== undefined && cached !== null) {
        return cached;
    }

    const value = await callback();

    await set(key, value, ttl);

    return value;
}
async function delByPrefix(prefix) {
    const redis = await getRedis();

    if (redis?.isReady) {
        try {
            const keys = await redis.keys(`${prefix}*`);

            if (keys.length > 0) {
                await redis.del(keys);
            }
        } catch {}
    }

    memoryCache.keys().forEach((key) => {
        if (key.startsWith(prefix)) {
            memoryCache.del(key);
        }
    });
}


export default {
    get,
    set,
    del,
    has,
    flush,
    remember,
    delByPrefix
};