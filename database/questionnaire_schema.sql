-- ExpoSpace questionnaire schema
-- Jalankan setelah database expo_space dan tabel users/teams tersedia.

USE expo_space;

CREATE TABLE IF NOT EXISTS questionnaire_questions (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    team_id CHAR(36) NOT NULL,
    section VARCHAR(255) NULL,
    question TEXT NOT NULL,
    sort_order INT UNSIGNED NOT NULL DEFAULT 0,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    PRIMARY KEY (id),
    CONSTRAINT questionnaire_questions_team_id_foreign
        FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS questionnaire_responses (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    team_id CHAR(36) NOT NULL,
    user_id BIGINT UNSIGNED NULL,
    respondent_role VARCHAR(50) NOT NULL DEFAULT 'mitra',
    respondent_name VARCHAR(255) NOT NULL,
    respondent_address TEXT NOT NULL,
    respondent_affiliation VARCHAR(50) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    PRIMARY KEY (id),
    UNIQUE KEY questionnaire_responses_team_user_unique (team_id, user_id),
    CONSTRAINT questionnaire_responses_team_id_foreign
        FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    CONSTRAINT questionnaire_responses_user_id_foreign
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS questionnaire_answers (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    response_id BIGINT UNSIGNED NOT NULL,
    question_id BIGINT UNSIGNED NOT NULL,
    score TINYINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    PRIMARY KEY (id),
    UNIQUE KEY questionnaire_answers_response_question_unique (response_id, question_id),
    CONSTRAINT questionnaire_answers_response_id_foreign
        FOREIGN KEY (response_id) REFERENCES questionnaire_responses(id) ON DELETE CASCADE,
    CONSTRAINT questionnaire_answers_question_id_foreign
        FOREIGN KEY (question_id) REFERENCES questionnaire_questions(id) ON DELETE CASCADE,
    CONSTRAINT questionnaire_answers_score_check CHECK (score BETWEEN 1 AND 5)
) ENGINE=InnoDB;

-- Template 10 pertanyaan untuk project milik user Capstone pertama.
-- Jika project Capstone sudah ada, query ini bisa dijalankan.
INSERT INTO questionnaire_questions (team_id, section, question, sort_order)
SELECT t.id, template.section, template.question, template.sort_order
FROM teams t
JOIN users u ON u.id = t.owner_id AND u.role = 'capstone'
JOIN (
    SELECT 'Kemudahan Penggunaan' AS section, 'Sistem mudah dipahami dan digunakan oleh pengguna.' AS question, 1 AS sort_order
    UNION ALL SELECT 'Kemudahan Penggunaan', 'Saya dapat menemukan informasi proyek yang dibutuhkan dengan mudah.', 2
    UNION ALL SELECT 'Kemudahan Penggunaan', 'Fitur-fitur dalam sistem tersusun secara jelas dan mudah diakses.', 3
    UNION ALL SELECT 'Pengelolaan Proyek', 'Sistem memudahkan mahasiswa dalam mengelola informasi proyek capstone.', 4
    UNION ALL SELECT 'Pengelolaan Proyek', 'Sistem memudahkan mahasiswa dalam mengunggah dan memperbarui poster proyek.', 5
    UNION ALL SELECT 'Pengelolaan Proyek', 'Sistem membantu mitra industri melihat informasi proyek yang ditawarkan mahasiswa.', 6
    UNION ALL SELECT 'Fitur dan Informasi', 'Informasi poster, landing page, alur bisnis, dan aplikasi proyek disajikan dengan jelas.', 7
    UNION ALL SELECT 'Fitur dan Informasi', 'Fitur yang tersedia sudah sesuai dengan kebutuhan mahasiswa dan mitra industri.', 8
    UNION ALL SELECT 'Kepuasan dan Manfaat', 'Sistem membantu meningkatkan efektivitas komunikasi dan pertukaran informasi antara mahasiswa dan mitra industri.', 9
    UNION ALL SELECT 'Kepuasan dan Manfaat', 'Secara keseluruhan, saya puas dengan sistem yang dikembangkan.', 10
) AS template ON 1 = 1
WHERE NOT EXISTS (
    SELECT 1 FROM questionnaire_questions existing
    WHERE existing.team_id = t.id
);
