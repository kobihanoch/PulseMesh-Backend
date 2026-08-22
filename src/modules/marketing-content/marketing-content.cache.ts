import { getCached, setCached } from '../../infrastructure/cache/redis.config.ts';
import type { MarketingContent } from './marketing-content.types.ts';

const TTL_SECONDS = 60 * 60 * 24 * 3;
export const marketingContentKey = 'marketing-content:public';

export const getCachedMarketingContent = () => getCached<MarketingContent[]>(marketingContentKey);
export const cacheMarketingContent = (content: MarketingContent[]) => setCached(marketingContentKey, content, TTL_SECONDS);
