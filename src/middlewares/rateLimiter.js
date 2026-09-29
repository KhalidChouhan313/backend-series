import redisClient from "../config/redis.js";

export const rateLimiter = (prefix, maxRequests, windowSeconds) => {
    return async (req, res, next) => {
        try {
            const key = `rateLimiter:${prefix}:${req.ip}`;
            const count = await redisClient.incr(key);
            if (count === 1) {
                await redisClient.expire(key, windowSeconds);
            }
            if (count > maxRequests) {
                const ttl = await redisClient.ttl(key);
                return res.status(429).json({
                    success: false,
                    message: `Too many requests. Try again in ${ttl} seconds.`
                });
            }
            next();
        } catch (error) {
            console.log("Rate limiter error:", error);
            next();
        }
    }
}