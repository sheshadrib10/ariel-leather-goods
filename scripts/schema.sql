-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Drop existing products table if exists for fresh seed
DROP TABLE IF EXISTS products CASCADE;

-- Products Table for Ariel Leather Goods
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    price_sgd NUMERIC(10, 2) NOT NULL,
    price_usd NUMERIC(10, 2) NOT NULL,
    material VARCHAR(255) NOT NULL,
    leather_type VARCHAR(100) NOT NULL,
    colour VARCHAR(100) NOT NULL,
    colour_family VARCHAR(50) NOT NULL,
    hardware VARCHAR(100),
    style_tags TEXT[] NOT NULL DEFAULT '{}',
    recipient_tags TEXT[] NOT NULL DEFAULT '{}',
    use_cases TEXT[] NOT NULL DEFAULT '{}',
    features TEXT[] NOT NULL DEFAULT '{}',
    dimensions VARCHAR(100),
    weight_grams INTEGER,
    in_stock BOOLEAN DEFAULT true,
    inventory_count INTEGER DEFAULT 25,
    popularity_score NUMERIC(5, 2) DEFAULT 85.0,
    margin_rate NUMERIC(5, 2) DEFAULT 68.0,
    rating NUMERIC(3, 2) DEFAULT 4.9,
    review_count INTEGER DEFAULT 42,
    image_url TEXT NOT NULL,
    gallery_images TEXT[] NOT NULL DEFAULT '{}',
    description TEXT NOT NULL,
    craftsmanship_notes TEXT,
    search_text TEXT,
    embedding vector(1024)
);

-- Indices for rapid hybrid filtering & vector retrieval
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_price ON products(price_sgd);
CREATE INDEX idx_products_in_stock ON products(in_stock);
CREATE INDEX idx_products_colour ON products(colour_family);
CREATE INDEX idx_products_embedding ON products USING hnsw (embedding vector_cosine_ops);
