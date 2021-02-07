DROP TABLE IF EXISTS upvotes CASCADE;

CREATE TABLE upvotes (
  id SERIAL PRIMARY KEY NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  contribution_id INTEGER REFERENCES contributions(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, contribution_id)
);
