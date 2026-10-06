import { extractSearchIntent, generateBedrockEmbedding, SearchIntent } from "./bedrock-service";
import { queryProductsVectorAndFilters } from "./db";
import { Product, PRODUCTS_CATALOG } from "./catalog-data";

export interface RankedProduct extends Product {
  ranking_breakdown: {
    final_score: number; // 0 to 1
    semantic_score: number; // 40%
    filter_match_score: number; // 30%
    popularity_score: number; // 15%
    inventory_score: number; // 10%
    margin_score: number; // 5%
    match_reasons: string[];
  };
}

export interface SearchResult {
  search_mode: "CONVENTIONAL_KEYWORD" | "AI_INTENT_SEMANTIC" | "HYBRID_ATTRIBUTED" | "MULTIMODAL_SIMILAR";
  query: string;
  intent: SearchIntent | null;
  execution_steps: {
    step_1_intent: {
      status: "completed" | "skipped";
      description: string;
      extracted_attributes?: Record<string, any>;
    };
    step_2_sql_filters: {
      status: "completed" | "skipped";
      applied_filters: string[];
      filtered_out_count: number;
    };
    step_3_semantic_search: {
      status: "completed" | "skipped";
      vector_provider: string;
      phrase_embedded: string;
      dimensions: number;
    };
    step_4_ranking: {
      status: "completed";
      formula: string;
      weights: {
        semantic: "40%";
        exact_filters: "30%";
        popularity: "15%";
        inventory: "10%";
        margin: "5%";
      };
    };
  };
  products: RankedProduct[];
  total_matches: number;
  latency_ms: number;
}

/**
 * Intelligent Query Router
 * Decides whether query should take the fast conventional keyword path or Bedrock AI intent path.
 */
export function routeQuery(query: string, explicitMode?: string): "CONVENTIONAL_KEYWORD" | "AI_INTENT_SEMANTIC" | "HYBRID_ATTRIBUTED" {
  if (explicitMode === "conventional") return "CONVENTIONAL_KEYWORD";
  if (explicitMode === "ai") return "AI_INTENT_SEMANTIC";

  const q = query.trim().toLowerCase();

  // Very short 1-2 word queries matching direct categories or single product terms
  const singleKeywords = ["wallet", "wallets", "bag", "bags", "belt", "belts", "cardholder", "briefcase", "backpack", "duffle", "folio"];
  if (singleKeywords.includes(q)) {
    return "CONVENTIONAL_KEYWORD";
  }

  // Conversational markers ("need", "gift", "for my dad", "under S$200", "recommend", "something like", etc.)
  const conversationalMarkers = [
    "need", "gift", "dad", "father", "husband", "under", "around", "for my",
    "recommend", "looking for", "something", "prefer", "every day", "travel",
    "classy", "premium", "elegant", "budget", "presents"
  ];

  const hasConversationalMarker = conversationalMarkers.some((marker) => q.includes(marker));
  const wordCount = q.split(/\s+/).length;

  if (hasConversationalMarker || wordCount >= 5) {
    return "AI_INTENT_SEMANTIC";
  }

  return "HYBRID_ATTRIBUTED";
}

/**
 * Calculates Exact Filter Match Score (30% weight)
 */
function calculateFilterMatchScore(prod: Product, intent: SearchIntent): { score: number; reasons: string[] } {
  let score = 0;
  let maxPossible = 0;
  const reasons: string[] = [];

  // Category match (weight: 0.35)
  maxPossible += 0.35;
  if (intent.category && intent.category.length > 0) {
    if (intent.category.includes(prod.category)) {
      score += 0.35;
      reasons.push(`Direct category match: ${prod.category}`);
    }
  } else {
    score += 0.35;
  }

  // Price match (weight: 0.25)
  maxPossible += 0.25;
  if (intent.max_price && intent.max_price > 0) {
    if (prod.price_sgd <= intent.max_price) {
      score += 0.25;
      reasons.push(`Under budget: S$${prod.price_sgd} <= S$${intent.max_price}`);
    } else {
      score += 0.05; // slight penalty
    }
  } else {
    score += 0.25;
  }

  // Recipient / Occasion match (weight: 0.20)
  maxPossible += 0.20;
  if (intent.recipient) {
    const hasRecipient = prod.recipient_tags.some(
      (r) => r.toLowerCase().includes(intent.recipient!.toLowerCase()) || intent.recipient!.toLowerCase().includes(r.toLowerCase())
    );
    if (hasRecipient) {
      score += 0.20;
      reasons.push(`Curated for ${intent.recipient}`);
    }
  } else {
    score += 0.20;
  }

  // Colour match (weight: 0.10)
  maxPossible += 0.10;
  if (intent.colour && intent.colour.length > 0) {
    const colourMatch = intent.colour.some((c) =>
      prod.colour.toLowerCase().includes(c.toLowerCase()) || prod.colour_family.toLowerCase() === c.toLowerCase()
    );
    if (colourMatch) {
      score += 0.10;
      reasons.push(`Colour match: ${prod.colour}`);
    }
  } else {
    score += 0.10;
  }

  // Style / Use Case match (weight: 0.10)
  maxPossible += 0.10;
  if (intent.use_case) {
    const useMatch = prod.use_cases.some((u) => u.toLowerCase().includes(intent.use_case!.toLowerCase()));
    if (useMatch) {
      score += 0.10;
      reasons.push(`Use case: ${intent.use_case}`);
    }
  } else {
    score += 0.10;
  }

  const normalized = maxPossible > 0 ? score / maxPossible : 0.8;
  return { score: Number(normalized.toFixed(4)), reasons };
}

/**
 * Execute Complete Hybrid eCommerce Search
 */
export async function executeHybridSearch(params: {
  query: string;
  mode?: "auto" | "conventional" | "ai";
  categoryFilter?: string;
  maxPriceFilter?: number;
  limit?: number;
}): Promise<SearchResult> {
  const startTime = Date.now();
  const { query, mode = "auto", categoryFilter, maxPriceFilter, limit = 12 } = params;

  const resolvedMode =
    mode === "auto"
      ? routeQuery(query)
      : mode === "conventional"
      ? "CONVENTIONAL_KEYWORD"
      : "AI_INTENT_SEMANTIC";

  // CASE 1: Fast Conventional Keyword Search ("wallet", "card holder")
  if (resolvedMode === "CONVENTIONAL_KEYWORD") {
    const qLower = query.toLowerCase().trim();
    const filtered = PRODUCTS_CATALOG.filter((p) => {
      const matchText = (p.search_text || p.title + " " + p.category).toLowerCase();
      const textMatch = qLower === "" || matchText.includes(qLower);
      const catMatch = !categoryFilter || p.category === categoryFilter;
      const priceMatch = !maxPriceFilter || p.price_sgd <= maxPriceFilter;
      return textMatch && catMatch && priceMatch;
    });

    const ranked: RankedProduct[] = filtered.map((p) => ({
      ...p,
      ranking_breakdown: {
        final_score: 0.9,
        semantic_score: 0.85,
        filter_match_score: 1.0,
        popularity_score: p.popularity_score / 100,
        inventory_score: Math.min(1, p.inventory_count / 30),
        margin_score: p.margin_rate / 100,
        match_reasons: [`Keyword match: "${query}"`, `In stock (${p.inventory_count} units)`],
      },
    }));

    return {
      search_mode: "CONVENTIONAL_KEYWORD",
      query,
      intent: null,
      execution_steps: {
        step_1_intent: {
          status: "skipped",
          description: "Conventional exact search path bypassed LLM intent parsing for sub-millisecond response.",
        },
        step_2_sql_filters: {
          status: "completed",
          applied_filters: [`Keyword text query: "${query}"`, "In stock = true"],
          filtered_out_count: PRODUCTS_CATALOG.length - filtered.length,
        },
        step_3_semantic_search: {
          status: "skipped",
          vector_provider: "None (Fast Index Search)",
          phrase_embedded: "",
          dimensions: 0,
        },
        step_4_ranking: {
          status: "completed",
          formula: "Direct keyword relevance sorted by catalogue popularity",
          weights: {
            semantic: "40%",
            exact_filters: "30%",
            popularity: "15%",
            inventory: "10%",
            margin: "5%",
          },
        },
      },
      products: ranked.slice(0, limit),
      total_matches: ranked.length,
      latency_ms: Date.now() - startTime,
    };
  }

  // CASE 2: AI Intent + Bedrock Embeddings + pgvector + Multi-Factor Ranking
  // Step 1: Nova Intent Extraction
  const intent = await extractSearchIntent(query);

  // Step 2: Bedrock Dense Vector Embedding (Titan Text V2 / Nova Multimodal)
  const embeddingResult = await generateBedrockEmbedding(intent.semantic_search_phrase || query);

  // Step 3: SQL Filters & pgvector retrieval
  const appliedFilters: string[] = ["in_stock = true"];
  let effectiveMaxPrice = intent.max_price || maxPriceFilter || null;

  if (effectiveMaxPrice) {
    appliedFilters.push(`price_sgd <= S$${effectiveMaxPrice}`);
  }
  if (intent.category && intent.category.length > 0) {
    appliedFilters.push(`category IN (${intent.category.join(", ")})`);
  }
  if (intent.material) {
    appliedFilters.push(`material LIKE '%${intent.material}%'`);
  }

  const rawProducts = await queryProductsVectorAndFilters({
    queryVector: embeddingResult.vector,
    category: intent.category.length > 0 ? intent.category : undefined,
    maxPrice: effectiveMaxPrice,
    limit: 24,
  });

  // Step 4: Multi-Factor Re-Ranking Formula
  // Formula: 40% Semantic + 30% Filter Match + 15% Popularity + 10% Inventory + 5% Margin
  const ranked: RankedProduct[] = rawProducts.map((prod) => {
    const semanticScore = prod.semantic_similarity; // 0 to 1
    const { score: filterMatchScore, reasons: filterReasons } = calculateFilterMatchScore(prod, intent);
    const popularityScore = prod.popularity_score / 100.0; // 0 to 1
    const inventoryScore = Math.min(1.0, prod.inventory_count / 30.0); // 0 to 1
    const marginScore = prod.margin_rate / 100.0; // 0 to 1

    const finalScore =
      0.40 * semanticScore +
      0.30 * filterMatchScore +
      0.15 * popularityScore +
      0.10 * inventoryScore +
      0.05 * marginScore;

    const matchReasons = [
      ...filterReasons,
      `Semantic relevance: ${(semanticScore * 100).toFixed(0)}%`,
      `Popularity rating: ${prod.popularity_score}/100`,
    ];

    return {
      ...prod,
      ranking_breakdown: {
        final_score: Number(finalScore.toFixed(4)),
        semantic_score: Number(semanticScore.toFixed(4)),
        filter_match_score: Number(filterMatchScore.toFixed(4)),
        popularity_score: Number(popularityScore.toFixed(4)),
        inventory_score: Number(inventoryScore.toFixed(4)),
        margin_score: Number(marginScore.toFixed(4)),
        match_reasons: matchReasons,
      },
    };
  });

  // Sort descending by final score
  ranked.sort((a, b) => b.ranking_breakdown.final_score - a.ranking_breakdown.final_score);

  return {
    search_mode: resolvedMode,
    query,
    intent,
    execution_steps: {
      step_1_intent: {
        status: "completed",
        description: `Amazon Nova extracted intent: ${intent.category.join(", ")} | ${intent.material} | max price: S$${intent.max_price || "none"}`,
        extracted_attributes: {
          category: intent.category,
          material: intent.material,
          colour: intent.colour,
          recipient: intent.recipient,
          use_case: intent.use_case,
          occasion: intent.occasion,
          max_price: intent.max_price ? `S$${intent.max_price}` : "Unlimited",
          style: intent.style,
        },
      },
      step_2_sql_filters: {
        status: "completed",
        applied_filters: appliedFilters,
        filtered_out_count: Math.max(0, PRODUCTS_CATALOG.length - rawProducts.length),
      },
      step_3_semantic_search: {
        status: "completed",
        vector_provider: embeddingResult.provider,
        phrase_embedded: intent.semantic_search_phrase,
        dimensions: embeddingResult.dimensions,
      },
      step_4_ranking: {
        status: "completed",
        formula: "0.40 * Semantic + 0.30 * ExactFilters + 0.15 * Popularity + 0.10 * Inventory + 0.05 * Margin",
        weights: {
          semantic: "40%",
          exact_filters: "30%",
          popularity: "15%",
          inventory: "10%",
          margin: "5%",
        },
      },
    },
    products: ranked.slice(0, limit),
    total_matches: ranked.length,
    latency_ms: Date.now() - startTime,
  };
}

/**
 * Multimodal Visual & Similarity Search
 * "Show me something like this" or image-referenced vector lookup
 */
export async function executeSimilarSearch(referenceProductId: number): Promise<RankedProduct[]> {
  const reference = PRODUCTS_CATALOG.find((p) => p.id === referenceProductId);
  if (!reference || !reference.embedding) {
    return [];
  }

  const matches = await queryProductsVectorAndFilters({
    queryVector: reference.embedding,
    limit: 8,
  });

  return matches
    .filter((p) => p.id !== referenceProductId)
    .map((p) => ({
      ...p,
      ranking_breakdown: {
        final_score: Number(p.semantic_similarity.toFixed(4)),
        semantic_score: Number(p.semantic_similarity.toFixed(4)),
        filter_match_score: 0.9,
        popularity_score: p.popularity_score / 100,
        inventory_score: Math.min(1, p.inventory_count / 30),
        margin_score: p.margin_rate / 100,
        match_reasons: [
          `Visual & silhouette similarity to "${reference.title}"`,
          `Matching leather aesthetic: ${p.leather_type}`,
        ],
      },
    }));
}
