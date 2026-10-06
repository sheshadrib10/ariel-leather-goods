import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Semantic vocab for generating deterministic 1024-D vectors
const SEMANTIC_VOCAB = {
  wallet: 10, bifold: 15, cardholder: 25, cardsleeve: 28, moneyclip: 32, passport: 38,
  bag: 50, briefcase: 55, messenger: 62, weekender: 70, duffle: 75, backpack: 82, sling: 90,
  belt: 105, watchroll: 120, techfolio: 130, valettray: 140, keychain: 145,
  leather: 160, fullgrain: 170, italian: 180, calfskin: 190, vachetta: 200, vegetabletanned: 210,
  horween: 220, chromexcel: 225, cordovan: 235, bridle: 245, saffiano: 255, chevre: 265,
  handcrafted: 275, burnished: 285,
  brown: 310, darkbrown: 315, espresso: 320, cognac: 330, tan: 340, saddle: 350,
  black: 360, charcoal: 370, burgundy: 380, oxblood: 385, navy: 395, brass: 410, gold: 420,
  father: 460, dad: 462, husband: 475, executive: 490, gentleman: 505, collector: 520, traveler: 535, friend: 550,
  gift: 610, birthday: 625, anniversary: 635, everyday: 670, businesstravel: 690, travel: 700, commute: 710,
  premium: 760, luxury: 770, minimal: 780, sleek: 790, classic: 805, heritage: 820,
  rfid: 910, laptop: 940, brassbuckle: 980
};

function generateEmbedding(text) {
  const dim = 1024;
  const vec = new Float64Array(dim).fill(0);
  const tokens = text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);

  for (let i = 0; i < dim; i++) {
    vec[i] = ((Math.sin(i * 12.9898 + 78.233) * 43758.5453) % 1) * 0.005;
  }

  for (const word of tokens) {
    let found = false;
    for (const [concept, anchor] of Object.entries(SEMANTIC_VOCAB)) {
      if (word === concept || word.includes(concept) || concept.includes(word)) {
        found = true;
        for (let offset = -6; offset <= 6; offset++) {
          const idx = (anchor + offset + dim) % dim;
          const weight = Math.exp(-(offset * offset) / (2 * 2.5 * 2.5));
          vec[idx] += (1.5 / Math.sqrt(tokens.length)) * weight;
        }
      }
    }
    if (!found) {
      let h = 2166136261;
      for (let c = 0; c < word.length; c++) {
        h = (h ^ word.charCodeAt(c)) * 16777619;
      }
      vec[Math.abs(h) % dim] += 0.8 / Math.sqrt(tokens.length);
    }
  }

  let norm = 0;
  for (let i = 0; i < dim; i++) norm += vec[i] * vec[i];
  norm = Math.sqrt(norm);
  return Array.from(vec).map(v => Number((norm > 0 ? v / norm : 0).toFixed(6)));
}

const PRODUCTS = [
  {
    title: "The Medici Bifold Wallet",
    slug: "medici-bifold-wallet-espresso",
    category: "wallet",
    subcategory: "bifold",
    price_sgd: 129,
    price_usd: 98,
    material: "Full-Grain Italian Calfskin",
    leather_type: "Full-Grain Vegetable-Tanned",
    colour: "Espresso Brown",
    colour_family: "brown",
    hardware: "Embossed Gold Foil Crest",
    style_tags: ["professional", "minimal", "classic", "premium"],
    recipient_tags: ["father", "husband", "executive", "him"],
    use_cases: ["everyday carry", "business travel", "gifting"],
    features: ["RFID-Blocking Interior Lining", "8 Dedicated Card Slots", "Dual Full-Length Bill Compartments", "Hand-Burnished Waxed Edges"],
    dimensions: "11.2 cm x 9.4 cm x 1.4 cm",
    weight_grams: 82,
    in_stock: true,
    inventory_count: 38,
    popularity_score: 98,
    margin_rate: 72,
    rating: 4.9,
    review_count: 142,
    image_url: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80",
    gallery_images: ["https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80"],
    description: "Handcrafted in Florence from certified Tuscan full-grain calfskin. Features hand-lacquered edges and an integrated RFID shield.",
    craftsmanship_notes: "Double-needle saddle stitched using German Serafil thread. The leather will develop a deep lustrous patina."
  },
  {
    title: "The Heritage Travel Folio",
    slug: "heritage-travel-folio-cognac",
    category: "accessory",
    subcategory: "tech_folio",
    price_sgd: 189,
    price_usd: 145,
    material: "Vegetable-Tanned Tuscan Vachetta",
    leather_type: "Vachetta Cowhide",
    colour: "Cognac Tan",
    colour_family: "tan",
    hardware: "Solid Antique Brass Snaps",
    style_tags: ["heritage", "premium", "executive", "classic"],
    recipient_tags: ["father", "executive", "traveler", "husband"],
    use_cases: ["business travel", "everyday", "gifting", "office"],
    features: ["Fits iPad Pro 11-inch", "Dedicated Passport & Boarding Pass Sleeve", "Elasticized Pen Loop", "4 Card Slots"],
    dimensions: "26.5 cm x 20.0 cm x 2.2 cm",
    weight_grams: 285,
    in_stock: true,
    inventory_count: 22,
    popularity_score: 92,
    margin_rate: 69,
    rating: 4.8,
    review_count: 89,
    image_url: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
    gallery_images: ["https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80"],
    description: "An indispensable heirloom travel organizer. Carries your tablet, passport, foreign currency, and daily notes.",
    craftsmanship_notes: "Untreated Vachetta leather tanned with mimosa extracts."
  },
  {
    title: "The Verona Slim Card Sleeve",
    slug: "verona-slim-card-sleeve-black",
    category: "card_holder",
    subcategory: "card_sleeve",
    price_sgd: 79,
    price_usd: 59,
    material: "French Chèvre Goatskin & Box Calf",
    leather_type: "Full-Grain Textured Chèvre",
    colour: "Midnight Black",
    colour_family: "black",
    hardware: "Blind Debossed Ariel Monogram",
    style_tags: ["minimal", "modern", "sleek", "compact"],
    recipient_tags: ["him", "her", "friend", "colleague", "father"],
    use_cases: ["everyday carry", "evening wear", "minimalist carry"],
    features: ["Ultra-Slim 4mm Profile", "4 Exterior Card Slots", "Central Folded Note Compartment", "RFID Shield"],
    dimensions: "10.0 cm x 7.2 cm x 0.4 cm",
    weight_grams: 34,
    in_stock: true,
    inventory_count: 54,
    popularity_score: 91,
    margin_rate: 76,
    rating: 4.9,
    review_count: 112,
    image_url: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80",
    gallery_images: ["https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80"],
    description: "The epitome of pocket minimalism. Disappears effortlessly into slim-tailored suits.",
    craftsmanship_notes: "Lined with supple French calfskin for silky card withdrawal."
  },
  {
    title: "The Sarto Executive Leather Briefcase",
    slug: "sarto-executive-leather-briefcase-dark-brown",
    category: "bag",
    subcategory: "briefcase",
    price_sgd: 580,
    price_usd: 440,
    material: "English Bridle Full-Grain Leather",
    leather_type: "Bridle Leather",
    colour: "Dark Espresso Brown",
    colour_family: "brown",
    hardware: "Solid Antique Brass YKK Excella Zippers",
    style_tags: ["executive", "formal", "luxury", "timeless", "professional"],
    recipient_tags: ["executive", "husband", "father"],
    use_cases: ["business travel", "boardroom", "daily commute", "office"],
    features: ["Padded Sleeve Fits up to 16-inch MacBook Pro", "Document Partition", "Detachable Shoulder Strap", "Rear Trolley Sleeve"],
    dimensions: "40.5 cm x 29.5 cm x 8.5 cm",
    weight_grams: 1420,
    in_stock: true,
    inventory_count: 12,
    popularity_score: 96,
    margin_rate: 65,
    rating: 5.0,
    review_count: 64,
    image_url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80",
    gallery_images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80"],
    description: "Engineered for high-stakes meetings and global transit. Constructed from resilient English bridle leather.",
    craftsmanship_notes: "Hand-molded handles filled with dense cord for comfortable all-day grip."
  },
  {
    title: "The Riviera 48-Hour Weekender Duffle",
    slug: "riviera-48-hour-weekender-saddle-tan",
    category: "bag",
    subcategory: "weekender",
    price_sgd: 640,
    price_usd: 485,
    material: "Horween Chromexcel Leather with Vachetta Trim",
    leather_type: "Pull-Up Chromexcel",
    colour: "Saddle Tan",
    colour_family: "tan",
    hardware: "Solid Matte Brass Hardware",
    style_tags: ["heritage", "travel", "sophisticated", "luxury"],
    recipient_tags: ["traveler", "husband", "father"],
    use_cases: ["weekend travel", "cabin luggage", "getaway", "business travel"],
    features: ["Separate Ventilated Shoe Compartment", "Overhead Bin Compliant", "Heavy-duty Excella Zippers", "Luggage Tag Included"],
    dimensions: "52.0 cm x 28.0 cm x 26.0 cm",
    weight_grams: 1950,
    in_stock: true,
    inventory_count: 8,
    popularity_score: 95,
    margin_rate: 64,
    rating: 4.9,
    review_count: 53,
    image_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    gallery_images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80"],
    description: "The definitive weekend companion. Cut from storied Horween Chromexcel leather that resists scuffs.",
    craftsmanship_notes: "Waterproof herringbone cotton drill lining protects fine tailoring."
  },
  {
    title: "The Aurelius Reversible Dress Belt",
    slug: "aurelius-reversible-dress-belt",
    category: "belt",
    subcategory: "dress_belt",
    price_sgd: 119,
    price_usd: 89,
    material: "Vegetable-Tanned Full-Grain Italian Leather",
    leather_type: "Full-Grain Italian Calf",
    colour: "Reversible Espresso Brown / Onyx Black",
    colour_family: "brown",
    hardware: "Solid Brass Rotational Buckle in Brushed Gunmetal",
    style_tags: ["formal", "classic", "versatile", "professional"],
    recipient_tags: ["father", "husband", "him", "executive"],
    use_cases: ["everyday carry", "office", "formal", "gifting"],
    features: ["Reversible Swivel Mechanism", "Beveled Feathered Edges", "Custom Trimmable Length", "Rigid Gift Box"],
    dimensions: "3.2 cm width x 115 cm length",
    weight_grams: 165,
    in_stock: true,
    inventory_count: 45,
    popularity_score: 93,
    margin_rate: 70,
    rating: 4.8,
    review_count: 98,
    image_url: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=800&q=80",
    gallery_images: ["https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=800&q=80"],
    description: "Two timeless belts in one. A simple pull-and-twist rotates the buckle from espresso brown to onyx black.",
    craftsmanship_notes: "Triple-ply laminated leather construction ensures no stretching."
  },
  {
    title: "The Grand Tourer Triple Watch Roll",
    slug: "grand-tourer-triple-watch-roll-cognac",
    category: "accessory",
    subcategory: "watch_roll",
    price_sgd: 199,
    price_usd: 150,
    material: "Saffiano Scratch-Resistant Italian Leather",
    leather_type: "Saffiano Calfskin",
    colour: "Cognac Brown with Emerald Green Lining",
    colour_family: "brown",
    hardware: "Quad Snap Buttons in Antique Brass",
    style_tags: ["luxury", "collector", "travel", "premium"],
    recipient_tags: ["father", "collector", "husband", "gentleman"],
    use_cases: ["watch collection", "business travel", "gifting", "everyday storage"],
    features: ["Modular Slide-in Rail System", "Protects up to 3 Timepieces", "Plush Anti-Tarnish Lining", "Flat Base Display"],
    dimensions: "22.5 cm x 10.0 cm x 7.5 cm",
    weight_grams: 340,
    in_stock: true,
    inventory_count: 18,
    popularity_score: 97,
    margin_rate: 71,
    rating: 4.9,
    review_count: 77,
    image_url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80",
    gallery_images: ["https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80"],
    description: "The ultimate sanctuary for treasured mechanical timepieces. Designed with deep partition walls.",
    craftsmanship_notes: "Saffiano crosshatch texture provides complete scratch and splash resistance."
  },
  {
    title: "The Milano Commuter Messenger Bag",
    slug: "milano-commuter-messenger-charcoal",
    category: "bag",
    subcategory: "messenger",
    price_sgd: 420,
    price_usd: 320,
    material: "Pebbled Full-Grain Calfskin",
    leather_type: "Supple Pebbled Grain",
    colour: "Charcoal Black",
    colour_family: "black",
    hardware: "Matte Gunmetal Hardware & Magnetic Clasps",
    style_tags: ["modern", "urban", "professional", "minimal"],
    recipient_tags: ["commuter", "executive", "husband", "him"],
    use_cases: ["daily commute", "work", "city travel", "everyday carry"],
    features: ["Padded Compartment for 14-inch Laptop", "Magnetic Clasps", "Water-Resistant Lining", "Passport Zipper Pocket"],
    dimensions: "36.0 cm x 27.0 cm x 9.0 cm",
    weight_grams: 980,
    in_stock: true,
    inventory_count: 15,
    popularity_score: 89,
    margin_rate: 67,
    rating: 4.8,
    review_count: 48,
    image_url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80",
    gallery_images: ["https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80"],
    description: "Designed for the urban commute. Supple pebbled calfskin drapes naturally against the hip.",
    craftsmanship_notes: "Glove-tanned leather treated with natural waxes."
  },
  {
    title: "The Sovereign Zippered Passport Wallet",
    slug: "sovereign-zippered-passport-wallet-tobacco",
    category: "wallet",
    subcategory: "travel_wallet",
    price_sgd: 149,
    price_usd: 112,
    material: "Full-Grain Waxed Pull-Up Leather",
    leather_type: "Waxed Pull-Up Cowhide",
    colour: "Tobacco Brown",
    colour_family: "brown",
    hardware: "Continuous YKK Excella Brass Zipper",
    style_tags: ["travel", "utilitarian", "heritage", "classic"],
    recipient_tags: ["traveler", "father", "husband", "family"],
    use_cases: ["business travel", "international travel", "vacation"],
    features: ["Holds 2 Passports", "Boarding Pass Gusset", "Micro-SIM Pockets", "RFID Blocking Shield"],
    dimensions: "19.5 cm x 11.5 cm x 2.0 cm",
    weight_grams: 140,
    in_stock: true,
    inventory_count: 26,
    popularity_score: 88,
    margin_rate: 73,
    rating: 4.7,
    review_count: 59,
    image_url: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80",
    gallery_images: ["https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80"],
    description: "All your travel documents under one secure zipper. Keeps foreign banknotes, passports, and boarding passes arranged.",
    craftsmanship_notes: "Infused with hot beeswax for a rugged water-resistant surface."
  },
  {
    title: "The Valet Catchall & Wireless Charger Tray",
    slug: "valet-catchall-wireless-charger-walnut",
    category: "accessory",
    subcategory: "valet_tray",
    price_sgd: 99,
    price_usd: 75,
    material: "Horween Dublin Leather",
    leather_type: "Vegetable-Tanned Dublin",
    colour: "Walnut Brown",
    colour_family: "brown",
    hardware: "Solid Brushed Brass Corner Snaps",
    style_tags: ["home", "office", "minimal", "gift", "classic"],
    recipient_tags: ["father", "executive", "him", "husband", "friend"],
    use_cases: ["nightstand", "desk organization", "gifting", "everyday carry"],
    features: ["15W Qi Fast Wireless Charging Coil", "Collapsible Snap Corners", "Soft Suede Underside", "Embossed Ariel Crest"],
    dimensions: "22.0 cm x 18.0 cm x 3.5 cm",
    weight_grams: 190,
    in_stock: true,
    inventory_count: 31,
    popularity_score: 94,
    margin_rate: 68,
    rating: 4.9,
    review_count: 105,
    image_url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
    gallery_images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80"],
    description: "The handsome drop zone for everyday essentials. Drop your phone to charge wirelessly while keys and watch rest in Horween leather.",
    craftsmanship_notes: "Cut from thick 6oz Dublin hides with rich pull-up undertones."
  },
  {
    title: "The Classic Cordovan Long Bifold Coat Wallet",
    slug: "classic-cordovan-long-bifold-oxblood",
    category: "wallet",
    subcategory: "bifold",
    price_sgd: 249,
    price_usd: 188,
    material: "Genuine Shell Cordovan & French Chèvre",
    leather_type: "Shell Cordovan",
    colour: "Deep Oxblood Burgundy",
    colour_family: "burgundy",
    hardware: "Blind Debossed Craft Hallmarks",
    style_tags: ["luxury", "heritage", "formal", "connoisseur"],
    recipient_tags: ["father", "connoisseur", "husband", "gentleman"],
    use_cases: ["formal dinner", "suit pocket", "everyday luxury"],
    features: ["Rare Equine Shell Cordovan", "12 Hand-Cut Card Slots", "Gusseted Banknote Sleeve", "Hand-Stitched Linen Thread"],
    dimensions: "18.8 cm x 9.5 cm x 1.0 cm",
    weight_grams: 95,
    in_stock: true,
    inventory_count: 10,
    popularity_score: 97,
    margin_rate: 62,
    rating: 5.0,
    review_count: 39,
    image_url: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80",
    gallery_images: ["https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80"],
    description: "Crafted from rare Shell Cordovan, famous for its non-creasing glass-like gloss and unmatched durability.",
    craftsmanship_notes: "Takes six months of artisanal tanning with vegetable liquors to produce a single cordovan shell."
  },
  {
    title: "The Field Notes & Pen Artisan Cover",
    slug: "field-notes-pen-artisan-cover-tan",
    category: "accessory",
    subcategory: "journal_cover",
    price_sgd: 69,
    price_usd: 52,
    material: "Vegetable-Tanned Badalassi Carlo Leather",
    leather_type: "Pueblo Vegetable Tanned",
    colour: "Olmo Saddle Tan",
    colour_family: "tan",
    hardware: "Solid Copper Rivets",
    style_tags: ["creative", "everyday carry", "heritage", "rugged"],
    recipient_tags: ["father", "writer", "creative", "friend"],
    use_cases: ["journaling", "field notes", "everyday carry", "gifting"],
    features: ["Includes 3x Field Notes Graph Booklets", "Elasticized Pen Loop", "Inside Card Slot", "Bookmark Ribbon"],
    dimensions: "15.0 cm x 10.2 cm x 1.5 cm",
    weight_grams: 88,
    in_stock: true,
    inventory_count: 40,
    popularity_score: 87,
    margin_rate: 74,
    rating: 4.8,
    review_count: 61,
    image_url: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
    gallery_images: ["https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80"],
    description: "The ideal gift for thoughtful note-takers. Pueblo leather starts with a distinct rustic nap and patinas beautifully.",
    craftsmanship_notes: "Tanned in Tuscany using centuries-old vacchetta methods."
  },
  {
    title: "The Sarto Minimalist Money Clip Bifold",
    slug: "sarto-minimalist-money-clip-navy",
    category: "wallet",
    subcategory: "money_clip",
    price_sgd: 109,
    price_usd: 82,
    material: "French Box Calf Leather",
    leather_type: "Smooth Box Calf",
    colour: "Midnight Navy & Saddle Tan",
    colour_family: "navy",
    hardware: "Tempered Spring-Steel Money Clip in Matte Gold",
    style_tags: ["minimal", "sleek", "modern", "premium"],
    recipient_tags: ["him", "father", "husband", "colleague"],
    use_cases: ["front pocket carry", "daily commute", "dining"],
    features: ["Spring-Tension Steel Clip", "6 Precision-Beveled Card Slots", "Quick-Access Thumb-Slide Slot", "RFID Protection Core"],
    dimensions: "10.8 cm x 7.8 cm x 0.8 cm",
    weight_grams: 58,
    in_stock: true,
    inventory_count: 32,
    popularity_score: 92,
    margin_rate: 70,
    rating: 4.8,
    review_count: 84,
    image_url: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80",
    gallery_images: ["https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80"],
    description: "Engineered specifically for front-pocket carry. A tempered steel clip holds banknotes securely.",
    craftsmanship_notes: "Hand-lined with French Chèvre goatskin for zero-friction access."
  },
  {
    title: "The Navigator Crossbody Sling Bag",
    slug: "navigator-crossbody-sling-matte-black",
    category: "bag",
    subcategory: "sling",
    price_sgd: 280,
    price_usd: 212,
    material: "Supple Italian Nappa Leather",
    leather_type: "Full-Grain Nappa",
    colour: "Matte Black",
    colour_family: "black",
    hardware: "German Fidlock V-Buckle & YKK Aquaguard Zips",
    style_tags: ["urban", "contemporary", "travel", "minimal"],
    recipient_tags: ["traveler", "him", "her", "husband"],
    use_cases: ["city walk", "travel essentials", "hands-free commute"],
    features: ["Fidlock Magnetic Mechanical V-Buckle", "Concealed Anti-Theft Back Pocket", "Sunglass Pockets", "Retractable Key Tether"],
    dimensions: "28.0 cm x 16.0 cm x 7.5 cm",
    weight_grams: 480,
    in_stock: true,
    inventory_count: 19,
    popularity_score: 86,
    margin_rate: 66,
    rating: 4.7,
    review_count: 42,
    image_url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80",
    gallery_images: ["https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80"],
    description: "Hands-free freedom crafted in butter-soft Italian Nappa leather. Features magnetic hardware for rapid access.",
    craftsmanship_notes: "Reinforced with lightweight Kevlar webbing for slash protection."
  },
  {
    title: "The Artisan Key Organizer & AirTag Case",
    slug: "artisan-key-organizer-airtag-saddle-brown",
    category: "accessory",
    subcategory: "keychain",
    price_sgd: 49,
    price_usd: 37,
    material: "Top-Grain Crazy Horse Waxed Leather",
    leather_type: "Crazy Horse Leather",
    colour: "Rustic Saddle Brown",
    colour_family: "brown",
    hardware: "Solid Stainless Steel Binding Post & Brass D-Ring",
    style_tags: ["compact", "functional", "everyday", "heritage"],
    recipient_tags: ["father", "colleague", "him", "friend"],
    use_cases: ["everyday carry", "silent keys", "tracking", "gifting"],
    features: ["Holds 2 to 7 Keys Silently", "Integrated AirTag Pocket", "Car Fob D-Ring", "Pocket-Friendly Profile"],
    dimensions: "8.5 cm x 2.2 cm x 2.0 cm",
    weight_grams: 38,
    in_stock: true,
    inventory_count: 60,
    popularity_score: 91,
    margin_rate: 76,
    rating: 4.8,
    review_count: 120,
    image_url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
    gallery_images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80"],
    description: "Transforms noisy, bulky keyrings into an elegant leather stack with seamless AirTag GPS location tracking.",
    craftsmanship_notes: "Crazy horse waxed leather rubs away minor scratches with fingertip warmth."
  },
  {
    title: "The Heritage Duffle Backpack Hybrid",
    slug: "heritage-duffle-backpack-hybrid-vintage-oak",
    category: "bag",
    subcategory: "backpack",
    price_sgd: 490,
    price_usd: 370,
    material: "Full-Grain Waxy Pull-Up Cowhide",
    leather_type: "Pull-Up Cowhide",
    colour: "Vintage Oak Brown",
    colour_family: "brown",
    hardware: "Solid Cast Brass D-Rings & Heavy Buckles",
    style_tags: ["rugged luxury", "heritage", "travel", "versatile"],
    recipient_tags: ["traveler", "photographer", "father", "husband"],
    use_cases: ["weekend travel", "work and gym", "commute", "outdoor"],
    features: ["Converts from Duffle to Backpack", "Stowable Air-Mesh Straps", "Side-Loading Padded Laptop Chamber", "Expandable Pocket"],
    dimensions: "48.0 cm x 30.0 cm x 20.0 cm",
    weight_grams: 1650,
    in_stock: true,
    inventory_count: 11,
    popularity_score: 94,
    margin_rate: 63,
    rating: 4.9,
    review_count: 57,
    image_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    gallery_images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80"],
    description: "The rugged chameleon of luggage. Carry it like an executive duffle or deploy the concealed backpack straps.",
    craftsmanship_notes: "Thick oil-tanned leather that repels rain and gains rugged character."
  }
];

async function seed() {
  const connectionString =
    process.env.DATABASE_URL ||
    `postgresql://postgres:postgres@127.0.0.1:32801/shulo`;

  console.log(`Connecting to PostgreSQL + pgvector at: ${connectionString.replace(/:[^:@]+@/, ":***@")}...`);

  const pool = new Pool({ connectionString });

  try {
    const schemaSql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf-8");
    console.log("Applying schema & pgvector extension...");
    await pool.query(schemaSql);
    console.log("Schema applied successfully.");

    console.log(`Embedding & inserting ${PRODUCTS.length} luxury leather products for Ariel Leather Goods...`);

    for (const p of PRODUCTS) {
      const searchText = [
        p.title, p.category, p.subcategory, p.material, p.leather_type,
        p.colour, p.colour_family, p.style_tags.join(" "),
        p.recipient_tags.map(r => `for ${r}`).join(" "),
        p.use_cases.join(" "), p.features.join(" "),
        p.description, p.craftsmanship_notes
      ].join(" ");

      const vec = generateEmbedding(searchText);
      const vecLiteral = `[${vec.join(",")}]`;

      const insertSql = `
        INSERT INTO products (
          title, slug, category, subcategory, price_sgd, price_usd, material,
          leather_type, colour, colour_family, hardware, style_tags, recipient_tags,
          use_cases, features, dimensions, weight_grams, in_stock, inventory_count,
          popularity_score, margin_rate, rating, review_count, image_url, gallery_images,
          description, craftsmanship_notes, search_text, embedding
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11, $12, $13,
          $14, $15, $16, $17, $18, $19,
          $20, $21, $22, $23, $24, $25,
          $26, $27, $28, $29::vector
        );
      `;

      await pool.query(insertSql, [
        p.title, p.slug, p.category, p.subcategory, p.price_sgd, p.price_usd, p.material,
        p.leather_type, p.colour, p.colour_family, p.hardware, p.style_tags, p.recipient_tags,
        p.use_cases, p.features, p.dimensions, p.weight_grams, p.in_stock, p.inventory_count,
        p.popularity_score, p.margin_rate, p.rating, p.review_count, p.image_url, p.gallery_images,
        p.description, p.craftsmanship_notes, searchText, vecLiteral
      ]);

      console.log(`  ✓ Inserted & embedded: [${p.category}] ${p.title} (S$${p.price_sgd})`);
    }

    const countRes = await pool.query("SELECT COUNT(*) FROM products");
    console.log(`\n🎉 Seed completed! ${countRes.rows[0].count} products loaded with 1024-D pgvector embeddings.`);
  } catch (err) {
    console.error("Seeding error:", err);
  } finally {
    await pool.end();
  }
}

seed();
