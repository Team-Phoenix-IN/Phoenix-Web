-- Phoenix Web Database Schema
-- Run this against your MySQL database to create the required tables.

CREATE DATABASE IF NOT EXISTS phoenix_web;
USE phoenix_web;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) DEFAULT NULL,
    display_name VARCHAR(100) DEFAULT NULL,
    photo_url TEXT DEFAULT NULL,
    google_id VARCHAR(255) DEFAULT NULL UNIQUE,
    riot_id VARCHAR(100) DEFAULT NULL,
    tracker_history JSON DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_email (email),
    INDEX idx_google_id (google_id)
);
