-- Recipe Database Schema
CREATE TABLE IF NOT EXISTS recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cuisine VARCHAR(255),
    title VARCHAR(255),
    rating FLOAT,
    prep_time INTEGER,
    cook_time INTEGER,
    total_time INTEGER,
    description TEXT,
    nutrients TEXT, -- JSON stored as TEXT
    serves VARCHAR(255)
);

-- Index for better performance
CREATE INDEX IF NOT EXISTS idx_rating ON recipes(rating);
CREATE INDEX IF NOT EXISTS idx_cuisine ON recipes(cuisine);
CREATE INDEX IF NOT EXISTS idx_title ON recipes(title);