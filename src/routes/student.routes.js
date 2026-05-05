import express from 'express';

import {
  createStudentController,
  getAllStudentsController,
  getStudentByIdController,
  updateStudentController,
  deleteStudentController,
} from '../controllers/student.controller.js';
import { validateRequest } from '../middlewares/validateRequest.middleware.js';
import {
  createStudentSchema,
  updateStudentSchema,
} from '../validationSchemas/student.schema.js';

const router = express.Router();

router.post(
  '/student',
  validateRequest(createStudentSchema),
  createStudentController,
);
router.get('/students', getAllStudentsController);
router.get('/student/:id', getStudentByIdController);
router.put(
  '/student/:id',
  validateRequest(updateStudentSchema),
  updateStudentController,
);
router.delete('/student/:id', deleteStudentController);

export default router;
