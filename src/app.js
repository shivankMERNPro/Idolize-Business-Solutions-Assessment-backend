import express from 'express';
import studentRoutes from './routes/student.routes.js';

const parentRoutes = express.Router();

parentRoutes.use('/api/v1', studentRoutes);

export default parentRoutes;
