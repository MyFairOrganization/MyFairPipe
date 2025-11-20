-- Enable UUID extension (optional, if you want to use UUIDs)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Photo table (base table for Profile Picture and Thumbnail)
CREATE TABLE Photo
(
    photo_id UUID PRIMARY KEY,
    path     VARCHAR(500) NOT NULL
);

-- Profile Picture table (inherits from Photo concept)
CREATE TABLE Profile_Picture
(
    profile_picture_id UUID PRIMARY KEY,
    photo_id           UUID REFERENCES Photo (photo_id) ON DELETE CASCADE
);

-- User table
CREATE TABLE "User"
(
    user_id         UUID PRIMARY KEY,
    user_email      VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255)        NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    username        VARCHAR(100) UNIQUE NOT NULL,
    displayname     VARCHAR(150),
    bio             TEXT,
    picture_id      UUID             REFERENCES Profile_Picture (profile_picture_id) ON DELETE SET NULL
);


-- Anonymous User table
CREATE TABLE Anonym_User
(
    temp_id     UUID PRIMARY KEY,
    session_id  VARCHAR(255) UNIQUE NOT NULL,
    valid_until TIMESTAMP           NOT NULL
);

-- Metadata table
CREATE TABLE Metadata
(
    metadata_id UUID PRIMARY KEY,
    likes       INTEGER DEFAULT 0,
    dislikes    INTEGER DEFAULT 0
);

-- Category table
CREATE TABLE Category
(
    category_id UUID PRIMARY KEY,
    name        VARCHAR(100) UNIQUE NOT NULL
);

-- Video table
CREATE TABLE Video
(
    video_id          UUID PRIMARY KEY,
    path              VARCHAR(500) NOT NULL,
    duration          INTEGER, -- in seconds
    title             VARCHAR(255) NOT NULL,
    description       TEXT,
    is_age_restricted BOOLEAN DEFAULT FALSE,
    tested            BOOLEAN DEFAULT FALSE,
    views             INTEGER DEFAULT 0,
    uploader          UUID REFERENCES "User" (user_id) ON DELETE CASCADE,
    metadata_id       UUID REFERENCES Metadata (metadata_id) ON DELETE CASCADE
);

-- Thumbnail table (inherits from Photo concept)
CREATE TABLE Thumbnail
(
    thumbnail_id UUID PRIMARY KEY,
    photo_id     UUID NOT NULL REFERENCES Photo (photo_id) ON DELETE CASCADE,
    video_id     UUID NOT NULL REFERENCES Video (video_id) ON DELETE CASCADE,
    is_active    BOOLEAN DEFAULT FALSE
);

CREATE UNIQUE INDEX one_active_thumbnail_per_video
    ON Thumbnail (video_id)
    WHERE is_active = TRUE;

-- Watch_History junction table
CREATE TABLE Watch_History
(
    user_id   UUID REFERENCES "User" (user_id) ON DELETE CASCADE,
    video_id  UUID REFERENCES Video (video_id) ON DELETE CASCADE,
    watchtime INTEGER DEFAULT 0, -- in seconds
    PRIMARY KEY (user_id, video_id)
);

-- Like_Video junction table
CREATE TABLE Like_Video
(
    user_id  UUID REFERENCES "User" (user_id) ON DELETE CASCADE,
    video_id UUID REFERENCES Video (video_id) ON DELETE CASCADE,
    is_like  BOOLEAN NOT NULL, -- TRUE for like, FALSE for dislike
    PRIMARY KEY (user_id, video_id)
);

-- Comment table
CREATE TABLE Comment
(
    comment_id UUID PRIMARY KEY,
    text       TEXT NOT NULL,
    written_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    author     UUID REFERENCES "User" (user_id) ON DELETE CASCADE,
    answer_to  UUID REFERENCES Comment (comment_id) ON DELETE CASCADE,
    video_id   UUID REFERENCES Video (video_id) ON DELETE CASCADE
);

-- Like_Comment junction table
CREATE TABLE Like_Comment
(
    user_id    UUID REFERENCES "User" (user_id) ON DELETE CASCADE,
    comment_id UUID REFERENCES Comment (comment_id) ON DELETE CASCADE,
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

-- Views for common queries

-- View for video details with metadata
CREATE VIEW Video_Details AS
SELECT v.video_id,
       v.title,
       v.description,
       v.duration,
       v.views,
       v.is_age_restricted,
       v.tested,
       u.username    AS uploader_username,
       u.displayname AS uploader_displayname,
       m.likes,
       m.dislikes
FROM Video v
         LEFT JOIN "User" u ON v.uploader = u.user_id
         LEFT JOIN Metadata m ON v.metadata_id = m.metadata_id;

-- View for user statistics
CREATE VIEW User_Statistics AS
SELECT u.user_id,
       u.username,
       u.displayname,
       COUNT(DISTINCT v.video_id)      AS total_videos,
       COALESCE(SUM(v.views), 0)       AS total_views
FROM "User" u
         LEFT JOIN Video v ON u.user_id = v.uploader
GROUP BY u.user_id, u.username, u.displayname;

COMMENT ON TABLE "User" IS 'Registered users of the platform';
COMMENT ON TABLE Anonym_User IS 'Anonymous/temporary users with session-based access';
COMMENT ON TABLE Video IS 'Video content uploaded by users';
COMMENT ON TABLE Comment IS 'Comments on videos, can be replies to other comments';
COMMENT ON TABLE Metadata IS 'Video metadata including likes and dislikes';
COMMENT ON TABLE Category IS 'Content categories';
COMMENT ON TABLE Watch_History IS 'Tracks which users watched which videos and for how long';
COMMENT ON TABLE Like_Video IS 'Tracks user likes/dislikes on videos';
COMMENT ON TABLE Like_Comment IS 'Tracks user likes/dislikes on comments';