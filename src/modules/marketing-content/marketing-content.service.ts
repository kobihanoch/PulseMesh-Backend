import { queryMarketingContent, queryUpdateMarketingContent } from './marketing-content.repository.ts';
import { marketingSections, type MarketingContent, type MarketingSection } from './marketing-content.types.ts';
import { cacheMarketingContent, getCachedMarketingContent } from './marketing-content.cache.ts';

export async function getMarketingContent(): Promise<MarketingContent[]> {
  const cachedContent = await getCachedMarketingContent();
  if (cachedContent) return cachedContent;

  const documents = await queryMarketingContent();
  const contentBySection = new Map(documents.map((document) => [document._id, document.content]));

  const content = marketingSections.map((section) => ({
    section,
    content: contentBySection.get(section) ?? '',
  }));
  await cacheMarketingContent(content);
  return content;
}

export async function updateMarketingContent(section: MarketingSection, content: string) {
  const updated = await queryUpdateMarketingContent(section, content);
  const documents = await queryMarketingContent();
  const contentBySection = new Map(documents.map((document) => [document._id, document.content]));
  await cacheMarketingContent(marketingSections.map((key) => ({ section: key, content: contentBySection.get(key) ?? '' })));
  return updated;
}
