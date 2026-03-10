CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE colleges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    college_name VARCHAR(255) NOT NULL UNIQUE,
    domain_name VARCHAR(255) NOT NULL UNIQUE
);



CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    roll_number VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255) NOT NULL ,
    role VARCHAR(59) NOT NULL,
    college_id UUID NOT NULL,
    section_id UUID,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT fk_college
                   FOREIGN KEY (college_id)
                   REFERENCES colleges(id)
                   ON DELETE RESTRICT

);
