-- PostgreSQL Database Schema for Media Platform

-- Enable UUID extension (optional, if you want to use UUIDs)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Photo table (base table for Profile Picture and Thumbnail)
DROP TABLE IF EXISTS Photo CASCADE;
CREATE TABLE Photo
(
    photo_id SERIAL PRIMARY KEY,
    path     VARCHAR(500) NOT NULL
);

-- Profile Picture table (inherits from Photo concept)
DROP TABLE IF EXISTS Profile_Picture CASCADE;
CREATE TABLE Profile_Picture
(
    profile_picture_id SERIAL PRIMARY KEY,
    photo_id           INTEGER REFERENCES Photo (photo_id) ON DELETE CASCADE
);

-- Thumbnail table (inherits from Photo concept)
DROP TABLE IF EXISTS Thumbnail CASCADE;
CREATE TABLE Thumbnail
(
    thumbnail_id SERIAL PRIMARY KEY,
    photo_id     INTEGER REFERENCES Photo (photo_id) ON DELETE CASCADE,
    is_active    BOOLEAN
);

-- User table
DROP TABLE IF EXISTS "User" CASCADE;
CREATE TABLE "User"
(
    user_id         SERIAL PRIMARY KEY,
    user_email      VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255)        NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    username        VARCHAR(100) UNIQUE NOT NULL,
    displayname     VARCHAR(150),
    bio             TEXT,
    anonym          BOOLEAN,
    picture_id      INTEGER             REFERENCES Profile_Picture (profile_picture_id) ON DELETE SET NULL
);

-- Anonymous User table
DROP TABLE IF EXISTS Anonym_User CASCADE;
CREATE TABLE Anonym_User
(
    temp_id     SERIAL PRIMARY KEY,
    session_id  VARCHAR(255) UNIQUE NOT NULL,
    valid_until TIMESTAMP           NOT NULL
);

-- Metadata table
DROP TABLE IF EXISTS Metadata CASCADE;
CREATE TABLE Metadata
(
    metadata_id SERIAL PRIMARY KEY,
    likes       INTEGER DEFAULT 0,
    dislikes    INTEGER DEFAULT 0
);

-- Video table
DROP TABLE IF EXISTS Video CASCADE;
CREATE TABLE Video
(
    video_id          SERIAL PRIMARY KEY,
    path              VARCHAR(500) NOT NULL,
    minio_path        VARCHAR(500),
    duration          INTEGER, -- in seconds
    title             VARCHAR(255) NOT NULL,
    description       TEXT,
    is_age_restricted BOOLEAN DEFAULT FALSE,
    tested            BOOLEAN DEFAULT FALSE,
    views             INTEGER DEFAULT 0,
    uploader          INTEGER REFERENCES "User" (user_id) ON DELETE CASCADE,
    thumbnail_id      INTEGER      REFERENCES Thumbnail (thumbnail_id) ON DELETE SET NULL,
    subtitle_path     VARCHAR(500),
    subtitle_language VARCHAR(255),
    subtitle_code     VARCHAR(255),
    likes             INTEGER DEFAULT 0,
    dislikes          INTEGER DEFAULT 0
);

-- Category table
DROP TABLE IF EXISTS Category CASCADE;
CREATE TABLE Category
(
    category_id SERIAL PRIMARY KEY,
    name        VARCHAR(100) UNIQUE NOT NULL
);

-- Tags table
DROP TABLE IF EXISTS Tags CASCADE;
CREATE TABLE Tags
(
    tag_id SERIAL PRIMARY KEY,
    term   VARCHAR(100) UNIQUE NOT NULL
);

-- Metadata_Category junction table
DROP TABLE IF EXISTS Metadata_Category CASCADE;
CREATE TABLE Metadata_Category
(
    category_id INTEGER REFERENCES Category (category_id) ON DELETE CASCADE,
    metadata_id INTEGER REFERENCES Metadata (metadata_id) ON DELETE CASCADE,
    PRIMARY KEY (category_id, metadata_id)
);

-- Tags_Category junction table
DROP TABLE IF EXISTS Tags_Category CASCADE;
CREATE TABLE Tags_Category
(
    tag_id      INTEGER REFERENCES Tags (tag_id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES Category (category_id) ON DELETE CASCADE,
    PRIMARY KEY (tag_id, category_id)
);

-- Subscriber junction table (self-referencing User table)
DROP TABLE IF EXISTS Subscriber CASCADE;
CREATE TABLE Subscriber
(
    user_id       INTEGER REFERENCES "User" (user_id) ON DELETE CASCADE,
    subscriber_id INTEGER REFERENCES "User" (user_id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, subscriber_id),
    CHECK (user_id != subscriber_id)
);

-- Watch_History junction table
DROP TABLE IF EXISTS Watch_History CASCADE;
CREATE TABLE Watch_History
(
    user_id   INTEGER REFERENCES "User" (user_id) ON DELETE CASCADE,
    video_id  INT REFERENCES Video (video_id) ON DELETE CASCADE,
    watchtime INTEGER DEFAULT 0, -- in seconds
    PRIMARY KEY (user_id, video_id)
);

-- Like_Video junction table
DROP TABLE IF EXISTS Like_Video CASCADE;
CREATE TABLE Like_Video
(
    user_id  INTEGER REFERENCES "User" (user_id) ON DELETE CASCADE,
    video_id INT REFERENCES Video (video_id) ON DELETE CASCADE,
    is_like  BOOLEAN NOT NULL, -- TRUE for like, FALSE for dislike
    PRIMARY KEY (user_id, video_id)
);

-- Comment table
DROP TABLE IF EXISTS Comment CASCADE;
CREATE TABLE Comment
(
    comment_id SERIAL PRIMARY KEY,
    text       TEXT NOT NULL,
    written_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    author     INTEGER REFERENCES "User" (user_id) ON DELETE CASCADE,
    answer_to  INTEGER REFERENCES Comment (comment_id) ON DELETE CASCADE,
    video_id   INT REFERENCES Video (video_id) ON DELETE CASCADE
);

-- Like_Comment junction table
DROP TABLE IF EXISTS Like_Comment CASCADE;
CREATE TABLE Like_Comment
(
    user_id    INTEGER REFERENCES "User" (user_id) ON DELETE CASCADE,
    comment_id INTEGER REFERENCES Comment (comment_id) ON DELETE CASCADE,
    is_like    BOOLEAN NOT NULL, -- TRUE for like, FALSE for dislike
    PRIMARY KEY (user_id, comment_id)
);

-- Indexes for performance optimization
CREATE INDEX idx_user_email ON "User" (user_email);
CREATE INDEX idx_user_username ON "User" (username);
CREATE INDEX idx_video_uploader ON Video (uploader);
CREATE INDEX idx_video_title ON Video (title);
CREATE INDEX idx_comment_video ON Comment (video_id);
CREATE INDEX idx_comment_author ON Comment (author);
CREATE INDEX idx_comment_answer_to ON Comment (answer_to);
CREATE INDEX idx_watch_history_user ON Watch_History (user_id);
CREATE INDEX idx_watch_history_video ON Watch_History (video_id);
CREATE INDEX idx_like_video_user ON Like_Video (user_id);
CREATE INDEX idx_like_video_video ON Like_Video (video_id);
CREATE INDEX idx_subscriber_user ON Subscriber (user_id);
CREATE INDEX idx_subscriber_subscriber ON Subscriber (subscriber_id);

COMMENT ON TABLE "User" IS 'Registered users of the platform';
COMMENT ON TABLE Anonym_User IS 'Anonymous/temporary users with session-based access';
COMMENT ON TABLE Video IS 'Video content uploaded by users';
COMMENT ON TABLE Comment IS 'Comments on videos, can be replies to other comments';
COMMENT ON TABLE Metadata IS 'Video metadata including likes and dislikes';
COMMENT ON TABLE Category IS 'Content categories';
COMMENT ON TABLE Tags IS 'Tags for categorizing content';
COMMENT ON TABLE Watch_History IS 'Tracks which users watched which videos and for how long';
COMMENT ON TABLE Like_Video IS 'Tracks user likes/dislikes on videos';
COMMENT ON TABLE Like_Comment IS 'Tracks user likes/dislikes on comments';
COMMENT ON TABLE Subscriber IS 'User subscription relationships';