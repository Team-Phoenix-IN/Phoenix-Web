-- Run these commands in your MySQL console or a tool like phpMyAdmin/DBeaver

-- Create database
CREATE DATABASE IF NOT EXISTS phoenix_db;
USE phoenix_db;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    display_name VARCHAR(100) DEFAULT NULL,
    riot_id VARCHAR(100) DEFAULT NULL,
    avatar_url VARCHAR(500) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create tracker history table
CREATE TABLE IF NOT EXISTS tracker_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    tag VARCHAR(100) NOT NULL,
    region VARCHAR(20) DEFAULT 'AP',
    avatar VARCHAR(500) DEFAULT NULL,
    timestamp BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY user_player_unique (user_id, name, tag)
);
