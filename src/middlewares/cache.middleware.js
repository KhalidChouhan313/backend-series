import redisClient from "../config/redis.js";

export const cacheMiddleware = (prefix, ttl = 60) => {
    return async (req, res, next) => {
        try {
            const cachekey = `${prefix}:${req.originalUrl}`;
            const cachedData = await redisClient.get(cachekey);
            if (cachedData) {
                return res.status(200).json({
                    ...JSON.parse(cachedData),
                    source: "cache"
                });
            }
            const originalJson = res.json.bind(res);
            res.json = (body) => {
                if (res.statusCode === 200) {
                    redisClient.setEx(cachekey, ttl, JSON.stringify(body)).catch(console.log);
                }
                return originalJson({ ...body, source: "database" });
            };

            next();
        } catch (error) {
            console.log("Cache error:", error);
            next();
        }
    }
}

export const clearCache = async (prefix) => {
    try {
        const keys = await redisClient.keys(`${prefix}:*`);
        if (keys.length > 0) {
            await redisClient.del(keys);
        }
    } catch (error) {
        console.log("Clear cache error:", error);
    }
}