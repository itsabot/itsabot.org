ALTER TABLE users ADD COLUMN verified BOOLEAN DEFAULT FALSE NOT NULL;
CREATE TABLE verifications (
	userid INTEGER UNIQUE NOT NULL,
	code VARCHAR(255) NOT NULL
);