-- schema.sql
-- Creates the jokes table for the Jokebook app

DROP TABLE IF EXISTS jokes;

CREATE TABLE jokes (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  setup TEXT NOT NULL,
  delivery TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
