import { mongoDB } from '../../infrastructure/db/mongodb/mongodb.client.ts';
import type { MarketingContentDocument, MarketingSection } from './marketing-content.types.ts';

const collection = () => mongoDB.collection<MarketingContentDocument>('marketing_content');

export async function queryMarketingContent() {
  return collection().find({}, { projection: { content: 1 } }).toArray();
}

export async function queryUpdateMarketingContent(section: MarketingSection, content: string) {
  await collection().updateOne({ _id: section }, { $set: { content } }, { upsert: true });
  return { section, content };
}
