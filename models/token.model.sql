create TABLE token (
id SERIAL PRIMARY KEY,
refresh_token VARCHAR(500),
user_id INTEGER,
FOREIGN KEY (user_id) REFERENCES users (id)
);