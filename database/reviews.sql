-- Create reviews table
CREATE TABLE IF NOT EXISTS review (
  review_id SERIAL PRIMARY KEY,
  review_text TEXT NOT NULL,
  review_rating INTEGER NOT NULL CHECK (review_rating >= 1 AND review_rating <= 5),
  review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  inventory_id INTEGER NOT NULL REFERENCES inventory(inventory_id) ON DELETE CASCADE,
  account_id INTEGER NOT NULL REFERENCES account(account_id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX idx_review_inventory ON review(inventory_id);
CREATE INDEX idx_review_account ON review(account_id);

-- Sample data (optional - for testing)
-- INSERT INTO review (review_text, review_rating, inventory_id, account_id)
-- VALUES ('Great car! Very reliable and fun to drive.', 5, 1, 1);

