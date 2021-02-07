DROP TABLE IF EXISTS stories CASCADE;

CREATE TABLE stories (
  id SERIAL PRIMARY KEY NOT NULL,
  creator_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  cover_photo_id INTEGER REFERENCES photos(id) ON DELETE CASCADE,
  status varchar(255) NOT NULL DEFAULT 'pending',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  first_entry TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
