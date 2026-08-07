export const marketingSections = ['participation', 'purchase', 'maintenance', 'registration'] as const;

export type MarketingSection = (typeof marketingSections)[number];

export type MarketingContent = {
  section: MarketingSection;
  content: string;
};

export type MarketingContentDocument = {
  _id: MarketingSection;
  content: string;
};
