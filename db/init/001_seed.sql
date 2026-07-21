INSERT INTO tracks (slug, title, description)
VALUES
  ('react', 'React', 'Build modern interactive interfaces with confidence.'),
  ('python', 'Python', 'Design maintainable backend services and business logic.'),
  ('sql', 'SQL', 'Model reliable data and write clear analytical queries.')
ON CONFLICT (slug) DO NOTHING;
