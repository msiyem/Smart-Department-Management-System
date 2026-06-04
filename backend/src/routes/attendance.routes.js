import { Router } from 'express';
import { takeAttendance, getCourseAttendance, myAttendance } from '../controllers/attendance.controller.js';
import { protect, authorize } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import { attendanceSchema } from '../validators/resource.validator.js';

const router = Router();
router.use(protect);

router.post('/', authorize('teacher'), validate(attendanceSchema), takeAttendance);
router.get('/',  authorize('teacher', 'admin'), getCourseAttendance);
router.get('/my', authorize('student'), myAttendance);

export default router;
