create TABLE users (
id SERIAL PRIMARY KEY,
email VARCHAR(255) UNIQUE,
password VARCHAR(255),
activated BOOLEAN DEFAULT false,
activationLink VARCHAR(255)
);