CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    fortytwo_id VARCHAR(255) UNIQUE,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    password VARCHAR(255),
    gender VARCHAR(255),
    sexual_preferences VARCHAR(255),
    fame_rating INT DEFAULT 0,
    biography VARCHAR(255),
    uuid VARCHAR(255),
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users_interests (
    user_id INT REFERENCES users (id) ON DELETE CASCADE,
    technology BOOLEAN DEFAULT false,
    sports BOOLEAN DEFAULT false,
    music BOOLEAN DEFAULT false,
    travel BOOLEAN DEFAULT false,
    food BOOLEAN DEFAULT false,
    movies BOOLEAN DEFAULT false,
    books BOOLEAN DEFAULT false,
    art BOOLEAN DEFAULT false,
    nature BOOLEAN DEFAULT false,
    fitness BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users_pictures (
    user_id INT REFERENCES users (id) ON DELETE CASCADE,
    picture_1 VARCHAR(255),
    picture_2 VARCHAR(255),
    picture_3 VARCHAR(255),
    picture_4 VARCHAR(255),
    picture_5 VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger function to create user-related entries
CREATE OR REPLACE FUNCTION create_user_related_entries()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO users_interests (user_id) VALUES (NEW.id);
    INSERT INTO users_pictures (user_id) VALUES (NEW.id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function after an insert on users
CREATE TRIGGER after_user_insert
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION create_user_related_entries();