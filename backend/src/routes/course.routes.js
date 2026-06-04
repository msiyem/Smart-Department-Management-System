import { Router } from 'express';
import {
  createCourse, getCourses, getCourse, updateCourse,
  deleteCourse, enrollStudent, assignTeacher, myCourses,
} from '../controllers/course.controller.js';
import { protect, authorize } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import {
  courseSchema, enrollSchema, assignTeacherSchema,
} from '../validators/resource.validator.js';

const router = Router();

router.use(protect);

router.get('/',    getCourses);
router.get('/my',  authorize('student'), myCourses);
router.get('/:id', getCourse);

router.post('/',              authorize('admin'), validate(courseSchema),        createCourse);
router.put('/:id',            authorize('admin'), validate(courseSchema),        updateCourse);
router.delete('/:id',         authorize('admin'),                                deleteCourse);
router.post('/enroll',        authorize('admin'), validate(enrollSchema),         enrollStudent);
router.post('/assign-teacher',authorize('admin'), validate(assignTeacherSchema),  assignTeacher);

export default router;
