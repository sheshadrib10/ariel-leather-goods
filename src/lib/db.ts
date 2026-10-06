import { Pool } from "pg";
import { PRODUCTS_CATALOG, Product } from "./catalog-data";
import { cosineSimilarity } from "./vector-math";

let pool: Pool | null = null;

export function getDbPool(): Pool {
  if (!pool) {
    const connectionString =
      process.env.DATABASE_URL ||
      `postgresql://${process.env.PGUSER || "postgres"}:${process.env.PGPASSWORD || "postgrespassword"}@${
        process.env.PGHOST || "127.0.0.1"
      }:${process.env.PGPORT || "5432"}/${process.env.PGDATABASE || "ariel_db"}`;

    pool = new Pool({
      connectionString,
      connectionTimeoutMillis: 3000,
      max: 10,
    });

    pool.on("error", (err) => {
      console.warn("[PostgreSQL] Unexpected client error:", err.message);
    });
  }
  return pool;
}

export async function testDbConnection(): Promise<{ ok: boolean; message: string; version?: string }> {
  try {
    const p = getDbPool();
    const res = await p.query("SELECT version(), (SELECT count(*) FROM products) as product_count");
    return {
      ok: true,
      message: `PostgreSQL + pgvector connected (${res.rows[0].product_count} products in catalog)`,
      version: res.rows[0].version,
    };
  } catch (err: any) {
    return {
      ok: false,
      message: `Database fallback active: ${err?.message || "Unavailable"}`,
    };
  }
}

/**
 * Executes Vector + Attribute hybrid search in PostgreSQL with pgvector,
 * or falls back gracefully to in-memory vector search if DB is unseeded.
 */
export async function queryProductsVectorAndFilters(params: {
  queryVector: number[];
  category?: string[];
  maxPrice?: number | null;
  colour?: string[];
  material?: string;
  limit?: number;
}): Promise<Array<Product & { semantic_similarity: number }>> {
  const { queryVector, category, maxPrice, colour, material, limit = 16 } = params;

  try {
    const p = getDbPool();
    const vectorStr = `[${queryVector.join(",")}]`;

    // Construct SQL with pgvector cosine distance
    const conditions: string[] = ["in_stock = true"];
    const values: any[] = [vectorStr];
    let valIdx = 2;

    if (maxPrice && maxPrice > 0) {
      conditions.push(`price_sgd <= $${valIdx}`);
      values.push(maxPrice);
      valIdx++;
    }

    if (category && category.length > 0) {
      conditions.push(`category = ANY($${valIdx})`);
      values.push(category);
      valIdx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const sql = `
      SELECT 
        id, title, slug, category, subcategory, price_sgd, price_usd, material, 
        leather_type, colour, colour_family, hardware, style_tags, recipient_tags, 
        use_cases, features, dimensions, weight_grams, in_stock, inventory_count, 
        popularity_score, margin_rate, rating, review_count, image_url, gallery_images, 
        description, craftsmanship_notes,
        (1 - (embedding <=> $1::vector)) as semantic_similarity
      FROM products
      ${whereClause}
      ORDER BY embedding <=> $1::vector ASC
      LIMIT ${limit};
    `;

    const result = await p.query(sql, values);

    if (result.rows && result.rows.length > 0) {
      return result.rows.map((row) => ({
        ...row,
        price_sgd: Number(row.price_sgd),
        price_usd: Number(row.price_usd),
        popularity_score: Number(row.popularity_score),
        margin_rate: Number(row.margin_rate),
        rating: Number(row.rating),
        semantic_similarity: Number(row.semantic_similarity) || 0.8,
      }));
    }
  } catch (err: any) {
    console.warn(`[pgvector Query] Falling back to in-memory vector calculations: ${err?.message}`);
  }

  // Resilient In-Memory Vector Search Fallback
  let candidates = PRODUCTS_CATALOG;

  if (maxPrice && maxPrice > 0) {
    candidates = candidates.filter((p) => p.price_sgd <= maxPrice);
  }

  if (category && category.length > 0) {
    candidates = candidates.filter((p) => category.includes(p.category));
  }

  const scored = candidates.map((prod) => {
    const sim = prod.embedding ? cosineSimilarity(queryVector, prod.embedding) : 0.75;
    return {
      ...prod,
      semantic_similarity: Number(sim.toFixed(4)),
    };
  });

  scored.sort((a, b) => b.semantic_similarity - a.semantic_similarity);
  return scored.slice(0, limit);
}
