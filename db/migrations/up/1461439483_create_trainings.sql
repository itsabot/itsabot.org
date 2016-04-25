CREATE TABLE trainings (
	id SERIAL,
	sentence TEXT NOT NULL,
	intent VARCHAR(255),
	pluginid INTEGER NOT NULL,
	createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
	UNIQUE (sentence, pluginid),
	PRIMARY KEY (id)
);
