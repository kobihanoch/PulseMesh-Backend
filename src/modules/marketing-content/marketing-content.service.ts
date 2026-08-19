import { queryMarketingContent, queryUpdateMarketingContent } from './marketing-content.repository.ts';
import { marketingSections, type MarketingContent, type MarketingSection } from './marketing-content.types.ts';

export async function getMarketingContent(): Promise<MarketingContent[]> {
  const documents = await queryMarketingContent();
  const contentBySection = new Map(documents.map((document) => [document._id, document.content]));

  return marketingSections.map((section) => ({
    section,
    content: contentBySection.get(section) ?? '',
  }));
}

export function updateMarketingContent(section: MarketingSection, content: string) {
  return queryUpdateMarketingContent(section, content);
}
