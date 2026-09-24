CREATE TABLE IF NOT EXISTS campuses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  city VARCHAR(100) NOT NULL,
  subtitle VARCHAR(200),
  summary TEXT,
  vibe VARCHAR(80),
  latitude DECIMAL(9, 6),
  longitude DECIMAL(9, 6),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(160),
  mobile VARCHAR(30),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (email),
  UNIQUE (mobile)
);

CREATE TABLE IF NOT EXISTS otp_verifications (
  id SERIAL PRIMARY KEY,
  phone_or_email VARCHAR(180) NOT NULL,
  otp_code VARCHAR(10) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS study_spots (
  id SERIAL PRIMARY KEY,
  campus_id INT REFERENCES campuses(id),
  name VARCHAR(120) NOT NULL,
  building VARCHAR(120),
  address TEXT,
  distance VARCHAR(40),
  noise_level INT CHECK (noise_level BETWEEN 1 AND 5),
  wifi_quality INT CHECK (wifi_quality BETWEEN 1 AND 5),
  outlets INT CHECK (outlets BETWEEN 1 AND 5),
  busyness INT CHECK (busyness BETWEEN 1 AND 5),
  rating DECIMAL(3, 2) DEFAULT 0,
  review_count INT DEFAULT 0,
  latitude DECIMAL(9, 6),
  longitude DECIMAL(9, 6),
  image_url TEXT,
  vibe VARCHAR(120),
  map_x INT,
  map_y INT,
  summary TEXT,
  tags TEXT[],
  features TEXT[],
  open_until VARCHAR(40),
  category VARCHAR(60),
  review_highlights TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  spot_id INT REFERENCES study_spots(id),
  student_name VARCHAR(120),
  rating INT CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  photo_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS spot_photos (
  id SERIAL PRIMARY KEY,
  spot_id INT REFERENCES study_spots(id),
  url TEXT NOT NULL,
  uploaded_by VARCHAR(120),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_study_spots_campus_id ON study_spots(campus_id);
CREATE INDEX IF NOT EXISTS idx_reviews_spot_id ON reviews(spot_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_mobile ON users(mobile);
