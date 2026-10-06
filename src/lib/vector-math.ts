/**
 * Ariel Leather Goods - Vector Math & Semantic Projection Engine
 * 1024-dimensional dense vector generator compatible with pgvector and Bedrock Titan/Nova space.
 */

// Core semantic concepts anchored to orthogonal sub-spaces in 1024-D
const SEMANTIC_VOCAB: Record<string, number> = {
  // Categories & Silhouettes (0-150)
  wallet: 10,
  bifold: 15,
  cardholder: 25,
  cardsleeve: 28,
  moneyclip: 32,
  passport: 38,
  bag: 50,
  briefcase: 55,
  messenger: 62,
  weekender: 70,
  duffle: 75,
  backpack: 82,
  sling: 90,
  belt: 105,
  watchroll: 120,
  techfolio: 130,
  valettray: 140,
  keychain: 145,

  // Materials & Craftsmanship (151-300)
  leather: 160,
  fullgrain: 170,
  italian: 180,
  calfskin: 190,
  vachetta: 200,
  vegetabletanned: 210,
  horween: 220,
  chromexcel: 225,
  cordovan: 235,
  bridle: 245,
  saffiano: 255,
  chevre: 265,
  handcrafted: 275,
  burnished: 285,

  // Colors & Tones (301-450)
  brown: 310,
  darkbrown: 315,
  espresso: 320,
  cognac: 330,
  tan: 340,
  saddle: 350,
  black: 360,
  charcoal: 370,
  burgundy: 380,
  oxblood: 385,
  navy: 395,
  brass: 410,
  gold: 420,

  // Recipients & Relationships (451-600)
  father: 460,
  dad: 462,
  husband: 475,
  executive: 490,
  gentleman: 505,
  collector: 520,
  traveler: 535,
  friend: 550,
  him: 565,
  her: 580,

  // Occasions & Purposes (601-750)
  gift: 610,
  birthday: 625,
  anniversary: 635,
  promotion: 645,
  christmas: 655,
  everyday: 670,
  daily: 675,
  businesstravel: 690,
  travel: 700,
  commute: 710,
  office: 720,
  formal: 735,

  // Styles & Aesthetics (751-900)
  premium: 760,
  luxury: 770,
  minimal: 780,
  sleek: 790,
  classic: 805,
  heritage: 820,
  vintage: 835,
  sophisticated: 850,
  rugged: 865,
  modern: 880,

  // Features (901-1023)
  rfid: 910,
  cardslots: 925,
  laptop: 940,
  padding: 950,
  zipper: 965,
  brassbuckle: 980,
  waterresistant: 995,
  compact: 1010,
};

export const VECTOR_DIMENSION = 1024;

/**
 * Normalizes text into lower-case alphanumeric tokens
 */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Deterministically projects text into a 1024-D normalized vector space.
 * Mimics high-dimensional dense embedding geometry.
 */
export function generateLocalEmbedding(text: string): number[] {
  const vec = new Float64Array(VECTOR_DIMENSION).fill(0);
  const tokens = tokenize(text);

  // Background harmonic noise for natural vector distribution
  for (let i = 0; i < VECTOR_DIMENSION; i++) {
    const hash = (Math.sin(i * 12.9898 + 78.233) * 43758.5453) % 1;
    vec[i] = hash * 0.005;
  }

  for (let t = 0; t < tokens.length; t++) {
    const word = tokens[t];
    // Check direct anchor
    let found = false;
    for (const [concept, anchorIndex] of Object.entries(SEMANTIC_VOCAB)) {
      if (word === concept || word.includes(concept) || concept.includes(word)) {
        found = true;
        // Distribute activation across a Gaussian bell curve around anchor
        const radius = 6;
        for (let offset = -radius; offset <= radius; offset++) {
          const idx = (anchorIndex + offset + VECTOR_DIMENSION) % VECTOR_DIMENSION;
          const weight = Math.exp(-(offset * offset) / (2 * 2.5 * 2.5));
          vec[idx] += (1.5 / Math.sqrt(tokens.length)) * weight;
        }
      }
    }

    if (!found) {
      // Deterministic pseudo-random distribution for unseen words
      let h = 2166136261;
      for (let c = 0; c < word.length; c++) {
        h = (h ^ word.charCodeAt(c)) * 16777619;
      }
      const idx = Math.abs(h) % VECTOR_DIMENSION;
      vec[idx] += 0.8 / Math.sqrt(tokens.length);
    }
  }

  // L2 Normalization
  let norm = 0;
  for (let i = 0; i < VECTOR_DIMENSION; i++) {
    norm += vec[i] * vec[i];
  }
  norm = Math.sqrt(norm);

  const normalized = new Array<number>(VECTOR_DIMENSION);
  for (let i = 0; i < VECTOR_DIMENSION; i++) {
    normalized[i] = norm > 0 ? Number((vec[i] / norm).toFixed(6)) : 0;
  }

  return normalized;
}

/**
 * Calculates cosine similarity between two unit vectors: dot product
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
  }
  return Math.max(0, Math.min(1, (dot + 1) / 2)); // mapped to [0, 1]
}

/**
 * Formats vector as pgvector string literal: '[0.0123, -0.0456, ...]'
 */
export function toPgVector(vec: number[]): string {
  return `[${vec.join(",")}]`;
}
