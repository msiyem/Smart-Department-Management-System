import { Router } from 'express';
import { publishResult, myResults, courseResults } from '../controllers/result.controller.js';
import { createNotice, getNotices, deleteNotice } from '../controllers/notice.controller.js';
import { createRoutine, getRoutine, deleteRoutine } from '../controllers/routine.controller.js';
import { adminDashboard, studentDashboard, teacherDashboard } from '../controllers/dashboard.controller.js';
import { protect, authorize } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import { resultSchema, noticeSchema, routineSchema } from '../validators/resource.validator.js';
import { uploadNotice } from '../middlewares/upload.js';

export const resultRouter = Router();
resultRouter.use(protect);
resultRouter.post('/',                    authorize('teacher', 'admin'), validate(resultSchema), publishResult);
resultRouter.get('/my',                   authorize('student'), myResults);
resultRouter.get('/course/:course_id',    authorize('teacher', 'admin'), courseResults);

export const noticeRouter = Router();
noticeRouter.use(protect);
noticeRouter.get('/',     getNotices);
noticeRouter.post('/',    authorize('admin', 'teacher'), uploadNotice.single('attachment'), validate(noticeSchema), createNotice);
noticeRouter.delete('/:id', authorize('admin', 'teacher'), deleteNotice);

export const routineRouter = Router();
routineRouter.use(protect);
routineRouter.get('/',    getRoutine);
routineRouter.post('/',   authorize('admin'), validate(routineSchema), createRoutine);
routineRouter.delete('/:id', authorize('admin'), deleteRoutine);

export const dashboardRouter = Router();
dashboardRouter.use(protect);
dashboardRouter.get('/admin',   authorize('admin'),   adminDashboard);
dashboardRouter.get('/student', authorize('student'), studentDashboard);
dashboardRouter.get('/teacher', authorize('teacher'), teacherDashboard);
