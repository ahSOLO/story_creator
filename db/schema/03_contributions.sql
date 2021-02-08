DROP TABLE IF EXISTS contributions CASCADE;

CREATE TABLE contributions (
  id SERIAL PRIMARY KEY NOT NULL,
  contributor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  story_id INTEGER REFERENCES stories(id) ON DELETE CASCADE,
  photo_id INTEGER REFERENCES photos(id) ON DELETE CASCADE,
  animation_id INTEGER REFERENCES animations(id) ON DELETE CASCADE,
  ambient_sound_id INTEGER REFERENCES ambient_sounds(id) ON DELETE CASCADE,
  text_position VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  order_rank INTEGER NOT NULL,
  status VARCHAR(255) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
