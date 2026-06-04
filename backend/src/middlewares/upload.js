import multer from 'multer';

const storage = multer.memoryStorage();

const IMAGE_LIMIT = 15 * 1024 * 1024;
const FILE_LIMIT = 50 * 1024 * 1024;

// Profile images
const imageFilter = (req, file, cb) => {
  const allowed = [
    'image/jpeg',
    'image/png',
    'image/webp',
  ];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, WEBP allowed'));
  }
};

// Assignments
const assignmentFilter = (req, file, cb) => {
  const allowed = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'application/zip',
    'application/x-zip-compressed',
  ];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type'));
  }
};

// Notices
const noticeFilter = (req, file, cb) => {
  const allowed = [
    'application/pdf',
    'image/jpeg',
    'image/png',
  ];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type'));
  }
};

export const uploadProfile = multer({
  storage,
  limits: { fileSize: IMAGE_LIMIT },
  fileFilter: imageFilter,
});

export const uploadAssignment = multer({
  storage,
  limits: { fileSize: FILE_LIMIT },
  fileFilter: assignmentFilter,
});

export const uploadNotice = multer({
  storage,
  limits: { fileSize: FILE_LIMIT },
  fileFilter: noticeFilter,
});