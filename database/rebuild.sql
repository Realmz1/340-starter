/* ===== Database Rebuild File ===== */

/* Drop tables if they exist */
DROP TABLE IF EXISTS account CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS classification CASCADE;

/* Create classification table */
CREATE TABLE classification (
  classification_id SERIAL PRIMARY KEY,
  classification_name VARCHAR(50) NOT NULL
);

/* Create inventory table */
CREATE TABLE inventory (
  inventory_id SERIAL PRIMARY KEY,
  inv_make VARCHAR(50) NOT NULL,
  inv_model VARCHAR(50) NOT NULL,
  inv_description TEXT NOT NULL,
  inv_image VARCHAR(100) NOT NULL,
  inv_thumbnail VARCHAR(100) NOT NULL,
  inv_price NUMERIC(10,2) NOT NULL,
  inv_year INT NOT NULL,
  classification_id INT NOT NULL,
  FOREIGN KEY (classification_id)
    REFERENCES classification(classification_id)
);

/* Create account table */
CREATE TABLE account (
  account_id SERIAL PRIMARY KEY,
  account_firstname VARCHAR(50) NOT NULL,
  account_lastname VARCHAR(50) NOT NULL,
  account_email VARCHAR(100) NOT NULL UNIQUE,
  account_password VARCHAR(255) NOT NULL,
  account_type VARCHAR(20) DEFAULT 'Client'
);

/* Insert seed data */
INSERT INTO classification (classification_name) VALUES ('Sport'), ('SUV'), ('Truck');

INSERT INTO inventory (inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, classification_id)
VALUES
('GM', 'Hummer', 'small interiors but big power', '/images/vehicles/hummer.jpg', '/images/vehicles/hummer-tn.jpg', 55000, 2022, 2),
('Chevrolet', 'Camaro', 'fast sport coupe', '/images/vehicles/camaro.jpg', '/images/vehicles/camaro-tn.jpg', 35000, 2021, 1);

/* ===== END OF REBUILD ===== */

/* Task 1.4 Update GM Hummer description */
UPDATE inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_make = 'GM' AND inv_model = 'Hummer';

/* Task 1.6 Update inventory image/thumbnail paths */
UPDATE inventory
SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');

/* Ensure thumbnail file names use the -tn convention instead of -thumb */
UPDATE inventory
SET inv_thumbnail = REPLACE(inv_thumbnail, '-thumb.', '-tn.');
