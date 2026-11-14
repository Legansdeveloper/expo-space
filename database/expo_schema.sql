-- ExpoSpace database schema
-- MySQL 8.0+ / MariaDB 10.6+
-- This file is an importable SQL alternative to the Laravel migrations.

CREATE DATABASE IF NOT EXISTS expo_space
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE expo_space;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('mitra', 'capstone') NOT NULL DEFAULT 'mitra',
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS teams (
    id CHAR(36) NOT NULL,
    team_name VARCHAR(255) NOT NULL,
    project_title VARCHAR(255) NOT NULL,
    project_description TEXT NULL,
    category VARCHAR(255) NULL,
    owner_id BIGINT UNSIGNED NOT NULL,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    PRIMARY KEY (id),
    CONSTRAINT teams_owner_id_foreign
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS posters (
    poster_id CHAR(36) NOT NULL,
    team_id CHAR(36) NOT NULL,
    poster_image VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    PRIMARY KEY (poster_id),
    UNIQUE KEY posters_team_id_unique (team_id),
    CONSTRAINT posters_team_id_foreign
        FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS landing_pages (
    landing_page_id CHAR(36) NOT NULL,
    team_id CHAR(36) NOT NULL,
    landing_page_url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    PRIMARY KEY (landing_page_id),
    UNIQUE KEY landing_pages_team_id_unique (team_id),
    CONSTRAINT landing_pages_team_id_foreign
        FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS business_flows (
    business_flow_id CHAR(36) NOT NULL,
    team_id CHAR(36) NOT NULL,
    business_flow_type ENUM('url', 'image') NOT NULL,
    business_flow_url VARCHAR(255) NULL,
    business_flow_image VARCHAR(255) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    PRIMARY KEY (business_flow_id),
    UNIQUE KEY business_flows_team_id_unique (team_id),
    CONSTRAINT business_flows_team_id_foreign
        FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    CONSTRAINT business_flows_one_source_check CHECK (
        (business_flow_type = 'url' AND business_flow_url IS NOT NULL AND business_flow_image IS NULL)
        OR
        (business_flow_type = 'image' AND business_flow_url IS NULL AND business_flow_image IS NOT NULL)
    )
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS applications (
    application_id CHAR(36) NOT NULL,
    team_id CHAR(36) NOT NULL,
    application_url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    PRIMARY KEY (application_id),
    UNIQUE KEY applications_team_id_unique (team_id),
    CONSTRAINT applications_team_id_foreign
        FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
) ENGINE=InnoDB;
