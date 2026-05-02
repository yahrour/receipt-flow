DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'receipt_category'
    ) THEN
        CREATE TYPE receipt_category AS ENUM ('groceries', 'restaurant', 'transport', 'entertainment', 'health', 'shopping', 'utilities', 'travel', 'other');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS receipts (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id TEXT REFERENCES "user"(id) ON DELETE CASCADE NOT NULL,
  merchant VARCHAR(255) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  receipt_date DATE NOT NULL,
  category receipt_category NOT NULL DEFAULT 'other',
  currency VARCHAR(10) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_preferences (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id TEXT REFERENCES "user"(id) ON DELETE CASCADE NOT NULL,
  currency VARCHAR(25) DEFAULT 'USD',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_preference UNIQUE (user_id)
);