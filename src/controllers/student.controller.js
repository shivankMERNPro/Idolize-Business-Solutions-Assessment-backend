import {
  createStudentService,
  getAllStudentsService,
  getStudentByIdService,
  updateStudentService,
  deleteStudentService,
} from '../services/student.service.js';
import { sendResponse } from '../utils/sendResponse.js';

const getErrorMessage = (error) =>
  error instanceof Error ? error.message : String(error);

export const createStudentController = async (req, res) => {
  try {
    const result = await createStudentService(req.body);
    return sendResponse(res, result.code, result);
  } catch (error) {
    return sendResponse(res, 500, getErrorMessage(error));
  }
};

export const getAllStudentsController = async (req, res) => {
  try {
    const page = Number.parseInt(String(req.query.page ?? ''), 10) || 1;
    const limit = Number.parseInt(String(req.query.limit ?? ''), 10) || 10;
    const result = await getAllStudentsService(page, limit);
    return sendResponse(res, result.code, result);
  } catch (error) {
    return sendResponse(res, 500, getErrorMessage(error));
  }
};

export const getStudentByIdController = async (req, res) => {
  try {
    const result = await getStudentByIdService(req.params.id);
    return sendResponse(res, result.code, result);
  } catch (error) {
    return sendResponse(res, 500, getErrorMessage(error));
  }
};

export const updateStudentController = async (req, res) => {
  try {
    const result = await updateStudentService(req.params.id, req.body);
    return sendResponse(res, result.code, result);
  } catch (error) {
    return sendResponse(res, 500, getErrorMessage(error));
  }
};

export const deleteStudentController = async (req, res) => {
  try {
    const result = await deleteStudentService(req.params.id);
    return sendResponse(res, result.code, result);
  } catch (error) {
    return sendResponse(res, 500, getErrorMessage(error));
  }
};
