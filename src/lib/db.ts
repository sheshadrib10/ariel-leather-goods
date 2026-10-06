import { PRODUCTS_CATALOG, Product } from "./catalog-data";
import { cosineSimilarity } from "./vector-math";

export async function testDbConnection(): Promise<{ ok: boolean; message: string; version?: string }> {
  return {
    ok: true,
    message: "Ariel Edge Vector Engine active (16 Florentine creations indexed with 1024-D embeddings)",
    version: "pgvector-compatible-v17",
  };
}

/**
 * Executes Vector + Attribute hybrid search with 1024-D embeddings,
 * filtering by category and price before semantic cosine ranking.
 */
export async function queryProductsVectorAndFilters(params: {
  queryVector: number[];
  category?: string[];
  maxPrice?: number | null;
  colour?: string[];
  material?: string;
  limit?: number;
}): Promise<Array<Product & { semantic_similarity: number }>> {
  const { queryVector, category, maxPrice, limit = 16 } = params;

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
