-- ================================================================
--  PRANVIX AI CHATBOT — DATABASE SCHEMA
--  Subject  : Java Fundamentals
--  Team     : Pratiksha, Anvesha Chauhan, Ujjwal Singh
--  Branch   : B.Tech CSE AI&B 1-A | BBDU, Lucknow
--  Database : MySQL / MariaDB
-- ================================================================

CREATE DATABASE IF NOT EXISTS pranvix_db;
USE pranvix_db;

-- ── Users Table ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100)  NOT NULL,
    email       VARCHAR(150)  NOT NULL UNIQUE,
    username    VARCHAR(50)   NOT NULL UNIQUE,
    password    VARCHAR(255)  NOT NULL,        -- bcrypt hash in production
    created_at  DATETIME      DEFAULT CURRENT_TIMESTAMP,
    last_login  DATETIME
);

-- ── Chat Sessions Table ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_sessions (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT           NOT NULL,
    title       VARCHAR(200)  DEFAULT 'New Chat',
    created_at  DATETIME      DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Chat Messages Table ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_messages (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    session_id  INT           NOT NULL,
    user_id     INT           NOT NULL,
    sender      ENUM('user','bot') NOT NULL,
    message     TEXT          NOT NULL,
    sent_at     DATETIME      DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id)    REFERENCES users(id)         ON DELETE CASCADE
);

-- ── Bot Responses Table (fallback/keyword responses) ────────────
CREATE TABLE IF NOT EXISTS bot_responses (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    keyword     VARCHAR(100)  NOT NULL UNIQUE,
    response    TEXT          NOT NULL
);

-- ── Sample Bot Responses ─────────────────────────────────────────
INSERT INTO bot_responses (keyword, response) VALUES
('hello',   'Hello! 👋 I am Pranvix, your AI study companion. How can I help?'),
('java',    'Java is an OOP language. Key concepts: Classes, Objects, Inheritance, Polymorphism ☕'),
('oop',     'OOP has 4 pillars: Encapsulation, Inheritance, Polymorphism, Abstraction.'),
('sql',     'SQL stands for Structured Query Language — used to manage relational databases.'),
('help',    'Ask me about Java, HTML, CSS, SQL, or any study topic!'),
('joke',    'Why do Java devs wear glasses? Because they don't C#! 😂'),
('bye',     'Goodbye! Keep studying hard! 👋'),
('bbdu',    'Babu Banarasi Das University, Lucknow — a top private university in UP!');

-- ── Useful Queries ───────────────────────────────────────────────

-- Register new user:
-- INSERT INTO users (name, email, username, password)
-- VALUES (?, ?, ?, ?);

-- Login check:
-- SELECT id, name, username, email FROM users
-- WHERE username = ? AND password = ?;

-- Create new chat session:
-- INSERT INTO chat_sessions (user_id, title) VALUES (?, ?);

-- Save a message:
-- INSERT INTO chat_messages (session_id, user_id, sender, message)
-- VALUES (?, ?, ?, ?);

-- Get all sessions for a user:
-- SELECT id, title, created_at FROM chat_sessions
-- WHERE user_id = ? ORDER BY created_at DESC;

-- Get messages for a session:
-- SELECT sender, message, sent_at FROM chat_messages
-- WHERE session_id = ? ORDER BY sent_at ASC;

-- Get total messages by user:
-- SELECT COUNT(*) as total FROM chat_messages WHERE user_id = ?;
