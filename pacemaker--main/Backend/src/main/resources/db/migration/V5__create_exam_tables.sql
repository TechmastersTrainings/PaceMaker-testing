CREATE TABLE IF NOT EXISTS exams (
    id BIGINT NOT NULL AUTO_INCREMENT,
    exam_title VARCHAR(255),
    time_limit_minutes INT,
    total_marks INT,
    created_by VARCHAR(255),
    created_at DATETIME,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS exam_questions (
    exam_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    PRIMARY KEY (exam_id, question_id)
);

CREATE TABLE IF NOT EXISTS attempts (
    id BIGINT NOT NULL AUTO_INCREMENT,
    student_id BIGINT,
    exam_id BIGINT,
    student_answers TEXT,
    score INT,
    attempted_at DATETIME,
    PRIMARY KEY (id)
);