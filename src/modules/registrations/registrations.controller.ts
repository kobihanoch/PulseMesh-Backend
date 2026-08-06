import type { Request, Response } from 'express';
import type {
  CreateRegistrationRequest,
  DeleteRegistrationRequest,
  GetRegistrationRequest,
  ListRegistrationsRequest,
  UpdateRegistrationRequest,
} from './types/registrations.request.types.ts';
import type { RegistrationResponse, RegistrationsListResponse } from './types/registrations.response.types.ts';
import {
  createPublicRegistration,
  deleteRegistrationById,
  getRegistrationById,
  getRegistrationsPage,
  updateRegistrationById,
} from './registrations.service.ts';

/**
 * Register a member of the public and their selected equipment.
 *
 * Creates one of the supported combinations: defibrillator only,
 * defibrillator with LoRa, or LoRa only.
 *
 * Route: POST /registrations
 * Access: Public
 */
export const createRegistration = async (
  req: Request<{}, RegistrationResponse, CreateRegistrationRequest>,
  res: Response<RegistrationResponse>,
): Promise<Response<RegistrationResponse>> => {
  const registration = await createPublicRegistration(req.body);
  return res.status(201).json(registration);
};

/**
 * Return a paginated and optionally filtered registration list.
 *
 * Route: GET /registrations
 * Access: Admin
 */
export const listRegistrations = async (
  req: Request<{}, RegistrationsListResponse, {}, ListRegistrationsRequest>,
  res: Response<RegistrationsListResponse>,
): Promise<Response<RegistrationsListResponse>> => {
  const registrations = await getRegistrationsPage(req.query);
  return res.status(200).json(registrations);
};

/**
 * Return one registrant together with their registered equipment.
 *
 * Route: GET /registrations/:registrantId
 * Access: Admin
 */
export const getRegistration = async (
  req: Request<GetRegistrationRequest['params'], RegistrationResponse>,
  res: Response<RegistrationResponse>,
): Promise<Response<RegistrationResponse>> => {
  const registration = await getRegistrationById(req.params.registrantId);
  return res.status(200).json(registration);
};

/**
 * Update the contact or medical-training details of one registrant.
 *
 * Route: PATCH /registrations/:registrantId
 * Access: Admin
 */
export const updateRegistration = async (
  req: Request<UpdateRegistrationRequest['params'], RegistrationResponse, UpdateRegistrationRequest['body']>,
  res: Response<RegistrationResponse>,
): Promise<Response<RegistrationResponse>> => {
  const registration = await updateRegistrationById(req.params.registrantId, req.body);
  return res.status(200).json(registration);
};

/**
 * Delete a registrant and their associated equipment.
 *
 * Route: DELETE /registrations/:registrantId
 * Access: Admin
 */
export const deleteRegistration = async (req: Request<DeleteRegistrationRequest['params']>, res: Response): Promise<Response> => {
  await deleteRegistrationById(req.params.registrantId);
  return res.status(204).send();
};
