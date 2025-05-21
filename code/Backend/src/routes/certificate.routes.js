import { Router } from 'express';
import { generateCourseCompletionCertificate } from '../controllers/certificate.controller.js';
import { verifyAccessToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/:courseId', verifyAccessToken, generateCourseCompletionCertificate);

export default router;
