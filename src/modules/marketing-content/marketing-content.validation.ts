import { z } from 'zod';
import { marketingSections } from './marketing-content.types.ts';

export const updateMarketingContentRequest = z.object({
  params: z.object({ section: z.enum(marketingSections) }),
  body: z.object({ content: z.string().max(20_000) }),
});

export type UpdateMarketingContentRequest = z.infer<typeof updateMarketingContentRequest>;
