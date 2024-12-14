CREATE TABLE users(
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    dob DATE,
    firstname VARCHAR(50),
    surname VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE exercise(
    ex_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    ex_name VARCHAR(200),
    ex_type VARCHAR(200),
    ex_date DATE,
    ex_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE exercise CHANGE COLUMN id ex_id INT AUTO_INCREMENT PRIMARY KEY;