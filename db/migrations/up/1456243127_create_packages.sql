CREATE EXTENSION pg_trgm;
CREATE TABLE packages (
	id SERIAL,
	name VARCHAR(255) UNIQUE NOT NULL,
	username VARCHAR(60) NOT NULL,
	description TEXT,
	readme TEXT,
	downloadcount INTEGER NOT NULL DEFAULT 0,
	createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updatedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY (id)
);
CREATE INDEX packages_trgm_idx ON packages USING gin (
	name gin_trgm_ops,
	username gin_trgm_ops,
	description gin_trgm_ops,
	readme gin_trgm_ops
);
