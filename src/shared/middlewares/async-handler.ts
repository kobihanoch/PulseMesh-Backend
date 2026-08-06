import { RequestHandler } from 'express';
import type { ZodType } from 'zod';

export const asyncHandler = <P, Res, Req, Q>(fn: RequestHandler<P, Res, Req, Q>, responseSchema?: ZodType<Res>): RequestHandler<P, Res, Req, Q> => {
  return async (req, res, next) => {
    const sendJson = res.json.bind(res);

    try {
      // Validate response schema on res.json
      if (responseSchema) {
        res.json = ((body: Res) => sendJson(responseSchema.parse(body))) as typeof res.json;
      }

      await fn(req, res, next);
    } catch (error) {
      res.json = sendJson;
      next(error);
    }
  };
};
