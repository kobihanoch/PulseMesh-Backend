import type { Request, Response } from 'express';
import { getMarketingContent, updateMarketingContent } from './marketing-content.service.ts';
import type { UpdateMarketingContentRequest } from './marketing-content.validation.ts';

/**
 * Return all editable marketing-content sections.
 *
 * Route: GET /marketing-content
 * Access: Public
 */
export async function listMarketingContent(_req: Request, res: Response) {
  return res.status(200).json(await getMarketingContent());
}

/**
 * Update one marketing-content section.
 *
 * Route: PATCH /marketing-content/:section
 * Access: Admin
 */
export async function editMarketingContent(
  req: Request<UpdateMarketingContentRequest['params'], {}, UpdateMarketingContentRequest['body']>,
  res: Response,
) {
  const result = await updateMarketingContent(req.params.section, req.body.content);
  return res.status(200).json(result);
}
