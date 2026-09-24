CREATE TABLE campuses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  city VARCHAR(100) NOT NULL,
  latitude DECIMAL(9, 6),
  longitude DECIMAL(9, 6),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE study_spots (
  id SERIAL PRIMARY KEY,
  campus_id INT REFERENCES campuses(id),
  name VARCHAR(120) NOT NULL,
  building VARCHAR(120),
  noise_level INT CHECK (noise_level BETWEEN 1 AND 5),
  wifi_quality INT CHECK (wifi_quality BETWEEN 1 AND 5),
  outlets INT CHECK (outlets BETWEEN 1 AND 5),
  busyness INT CHECK (busyness BETWEEN 1 AND 5),
  rating DECIMAL(3, 2) DEFAULT 0,
  latitude DECIMAL(9, 6),
  longitude DECIMAL(9, 6),
  image_url TEXT,
  summary TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  spot_id INT REFERENCES study_spots(id),
  student_name VARCHAR(120),
  rating INT CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  photo_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE spot_photos (
  id SERIAL PRIMARY KEY,
  spot_id INT REFERENCES study_spots(id),
  url TEXT NOT NULL,
  uploaded_by VARCHAR(120),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_study_spots_campus_id ON study_spots(campus_id);
CREATE INDEX idx_reviews_spot_id ON reviews(spot_id);
