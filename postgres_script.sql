CREATE DATABASE microgame;
\c microgame;

DROP TABLE IF EXISTS high_score;
CREATE TABLE high_score(
	id serial PRIMARY KEY,
	name VARCHAR(10) NOT NULL,
	score INT NOT NULL
);