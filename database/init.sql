CREATE TYPE receipt_category AS ENUM ('groceries', 'restaurant', 'transport', 'entertainment', 'health', 'shopping', 'utilities', 'travel', 'other');

CREATE TABLE receipts (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id TEXT REFERENCES "user"(id) ON DELETE CASCADE NOT NULL,
  merchant VARCHAR(255) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  receipt_date DATE NOT NULL,
  category receipt_category NOT NULL DEFAULT 'other',
  currency_symbol CHAR(3) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);