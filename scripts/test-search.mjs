import pg from "pg";
const { Pool } = pg;

async function test() {
  const pool = new Pool({ connectionString: "postgresql://postgres:postgres@127.0.0.1:32801/shulo" });

  console.log("=== Testing pgvector cosine similarity search ===");
  // Query for: "Italian full-grain leather wallet"
  const res = await pool.query(`
    SELECT title, category, price_sgd, material,
           (1 - (embedding <=> (SELECT embedding FROM products WHERE id = 1))) as similarity
    FROM products
    ORDER BY similarity DESC
    LIMIT 5;
  `);

  console.log("Top 5 similar products to Medici Bifold Wallet:");
  for (const r of res.rows) {
    console.log(`  • ${r.title} (${r.category}, S$${r.price_sgd}) - Similarity: ${(Number(r.similarity) * 100).toFixed(1)}%`);
  }

  await pool.end();
}

test();
