import { rateLimiter } from "./redis";

export const rateLimit = (identifier, route, limit, windowSecs) => 
    rateLimiter.check(identifier, route, limit, windowSecs)