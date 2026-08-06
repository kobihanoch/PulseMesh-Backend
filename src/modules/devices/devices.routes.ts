import { Router, type RequestHandler } from 'express';
import { withRlsTx } from '../../infrastructure/db/db.client.ts';
import { asyncHandler } from '../../shared/middlewares/async-handler.ts';
import { authenticate } from '../../shared/middlewares/authentication.ts';
import { authorize } from '../../shared/middlewares/authorization.ts';
import { validate } from '../../shared/middlewares/validate-request.ts';
import { deleteDevice, getDevice, listDevices, updateDevice } from './devices.controller.ts';
import { deleteDeviceRequest, getDeviceRequest, listDevicesRequest, updateDeviceRequest } from './types/devices.request.types.ts';
import { deviceResponse, devicesListResponse } from './types/devices.response.types.ts';

const router = Router();

router.use(authenticate, authorize('admin'));
router.get('/', validate(listDevicesRequest), asyncHandler(withRlsTx(listDevices), devicesListResponse) as unknown as RequestHandler);
router.get('/:deviceType/:deviceId', validate(getDeviceRequest), asyncHandler(withRlsTx(getDevice), deviceResponse));
router.patch('/:deviceType/:deviceId', validate(updateDeviceRequest), asyncHandler(withRlsTx(updateDevice), deviceResponse));
router.delete('/:deviceType/:deviceId', validate(deleteDeviceRequest), asyncHandler(withRlsTx(deleteDevice)));

export default router;
