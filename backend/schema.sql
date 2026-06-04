-- ============================================================
-- Department Smart Management System - Database Schema
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;
SET sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO';

-- ------------------------------------------------------------
-- 1. users
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id            BIGINT PRIMARY KEY AUTO_INCREMENT,
    full_name     VARCHAR(100) NOT NULL,
    email         VARCHAR(100) UNIQUE NOT NULL,
    password      VARCHAR(255) NOT NULL,
    role          ENUM('admin','teacher','student') NOT NULL,
    profile_image VARCHAR(255) DEFAULT NULL,
    is_active     TINYINT(1) NOT NULL DEFAULT 1,
    last_login_at DATETIME DEFAULT NULL,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_users_role (role),
    INDEX idx_users_email (email)
);

-- ------------------------------------------------------------
-- 2. refresh_tokens
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id         BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id    BIGINT NOT NULL,
    token      VARCHAR(512) NOT NULL,
    expires_at DATETIME NOT NULL,
    revoked    TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uq_refresh_token (token(255)),
    INDEX idx_rt_user_id (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS refresh_tokens;

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id                BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id           BIGINT NOT NULL,
    session_id        VARCHAR(255) NOT NULL,
    token             VARCHAR(255) NOT NULL,
    replaced_by_token VARCHAR(255) DEFAULT NULL,
    expires_at        DATETIME NOT NULL,
    revoked_at        DATETIME DEFAULT NULL,
    is_revoked        TINYINT(1) NOT NULL DEFAULT 0,
    created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_user_id (user_id),
    INDEX idx_session (session_id),

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 3. students
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS students (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id         BIGINT UNIQUE NOT NULL,
    registration_no VARCHAR(50) UNIQUE NOT NULL,
    session         VARCHAR(20) NOT NULL,
    semester        TINYINT UNSIGNED NOT NULL DEFAULT 1,
    cgpa            DECIMAL(4,2) NOT NULL DEFAULT 0.00,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 4. teachers
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS teachers (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id     BIGINT UNIQUE NOT NULL,
    designation VARCHAR(100) NOT NULL DEFAULT 'Lecturer',
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 5. courses
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS courses (
    id           BIGINT PRIMARY KEY AUTO_INCREMENT,
    course_code  VARCHAR(20) UNIQUE NOT NULL,
    course_title VARCHAR(100) NOT NULL,
    credit       DECIMAL(3,1) NOT NULL,
    semester     TINYINT UNSIGNED NOT NULL,
    is_active    TINYINT(1) NOT NULL DEFAULT 1,
    created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_courses_semester (semester)
);

-- ------------------------------------------------------------
-- 6. enrollments
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS enrollments (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id  BIGINT NOT NULL,
    course_id   BIGINT NOT NULL,
    enrolled_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uq_enrollment (student_id, course_id),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 7. course_teachers
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS course_teachers (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    teacher_id  BIGINT NOT NULL,
    course_id   BIGINT NOT NULL,
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uq_course_teacher (teacher_id, course_id),
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 8. attendance
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attendance (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id      BIGINT NOT NULL,
    course_id       BIGINT NOT NULL,
    attendance_date DATE NOT NULL,
    status          ENUM('present','absent') NOT NULL,
    taken_by        BIGINT DEFAULT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uq_attendance (student_id, course_id, attendance_date),
    INDEX idx_attendance_date (attendance_date),
    INDEX idx_attendance_course (course_id),

    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 9. assignments
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS assignments (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    course_id   BIGINT NOT NULL,
    teacher_id  BIGINT NOT NULL,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    file_url    VARCHAR(512) DEFAULT NULL,
    due_date    DATETIME NOT NULL,
    max_marks   DECIMAL(5,2) NOT NULL DEFAULT 100.00,
    is_active   TINYINT(1) NOT NULL DEFAULT 1,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_assignments_course (course_id),
    INDEX idx_assignments_due (due_date),

    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 10. assignment_submissions
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS assignment_submissions (
    id            BIGINT PRIMARY KEY AUTO_INCREMENT,
    assignment_id BIGINT NOT NULL,
    student_id    BIGINT NOT NULL,
    file_url      VARCHAR(512) DEFAULT NULL,
    comment       TEXT,
    submitted_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    marks         DECIMAL(5,2) DEFAULT NULL,
    feedback      TEXT DEFAULT NULL,
    graded_at     TIMESTAMP DEFAULT NULL,

    UNIQUE KEY uq_submission (assignment_id, student_id),
    INDEX idx_sub_student (student_id),

    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 11. class_routines
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS class_routines (
    id         BIGINT PRIMARY KEY AUTO_INCREMENT,
    course_id  BIGINT NOT NULL,
    teacher_id BIGINT NOT NULL,
    room_no    VARCHAR(20) DEFAULT NULL,
    day        ENUM('Saturday','Sunday','Monday','Tuesday','Wednesday','Thursday','Friday') NOT NULL,
    start_time TIME NOT NULL,
    end_time   TIME NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_routine_day (day),
    INDEX idx_routine_course (course_id),

    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 12. notices
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notices (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    attachment  VARCHAR(512) DEFAULT NULL,
    priority    ENUM('low','medium','high') NOT NULL DEFAULT 'medium',
    created_by  BIGINT DEFAULT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_notices_priority (priority),

    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ------------------------------------------------------------
-- 13. results
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS results (
    id         BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    course_id  BIGINT NOT NULL,
    marks      DECIMAL(5,2) NOT NULL,
    grade      VARCHAR(5) DEFAULT NULL,
    gpa        DECIMAL(4,2) DEFAULT NULL,
    remarks    VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uq_result (student_id, course_id),

    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

SET FOREIGN_KEY_CHECKS = 1;