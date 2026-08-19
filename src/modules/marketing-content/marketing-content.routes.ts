import { Router } from 'express';
import { asyncHandler } from '../../shared/middlewares/async-handler.ts';
import { authenticate } from '../../shared/middlewares/authentication.ts';
import { authorize } from '../../shared/middlewares/authorization.ts';
import { validate } from '../../shared/middlewares/validate-request.ts';
import { editMarketingContent, listMarketingContent } from './marketing-content.controller.ts';
import { updateMarketingContentRequest } from './marketing-content.validation.ts';

const router = Router();

router.get('/', asyncHandler(listMarketingContent));
router.patch('/:section', authenticate, authorize('admin'), validate(updateMarketingContentRequest), asyncHandler(editMarketingContent));

export default router;
