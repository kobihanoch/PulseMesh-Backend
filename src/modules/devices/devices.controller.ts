import type { Request, Response } from 'express';
import type { DeleteDeviceRequest, GetDeviceRequest, ListDevicesRequest, UpdateDeviceRequest } from './types/devices.request.types.ts';
import type { DeviceResponse, DevicesListResponse } from './types/devices.response.types.ts';
import { deleteDeviceById, getDeviceById, getDevicesPage, updateDeviceById } from './devices.service.ts';

/**
 * Return a paginated and optionally filtered list of registered devices.
 *
 * Route: GET /devices
 * Access: Admin
 */
export const listDevices = async (
  req: Request<{}, DevicesListResponse, {}, ListDevicesRequest>,
  res: Response<DevicesListResponse>,
): Promise<Response<DevicesListResponse>> => {
  const devices = await getDevicesPage(req.query);
  return res.status(200).json(devices);
};

/**
 * Return one defibrillator or LoRa device by its type and identifier.
 *
 * Route: GET /devices/:deviceType/:deviceId
 * Access: Admin
 */
export const getDevice = async (
  req: Request<GetDeviceRequest['params'], DeviceResponse>,
  res: Response<DeviceResponse>,
): Promise<Response<DeviceResponse>> => {
  const device = await getDeviceById(req.params.deviceType, req.params.deviceId);
  return res.status(200).json(device);
};

/**
 * Update the administrative fields of one defibrillator or LoRa device.
 *
 * Route: PATCH /devices/:deviceType/:deviceId
 * Access: Admin
 */
export const updateDevice = async (
  req: Request<UpdateDeviceRequest['params'], DeviceResponse, UpdateDeviceRequest['body']>,
  res: Response<DeviceResponse>,
): Promise<Response<DeviceResponse>> => {
  const device = await updateDeviceById(req.params.deviceType, req.params.deviceId, req.body);
  return res.status(200).json(device);
};

/**
 * Delete one defibrillator or LoRa device.
 *
 * Route: DELETE /devices/:deviceType/:deviceId
 * Access: Admin
 */
export const deleteDevice = async (req: Request<DeleteDeviceRequest['params']>, res: Response): Promise<Response> => {
  await deleteDeviceById(req.params.deviceType, req.params.deviceId);
  return res.status(204).send();
};
