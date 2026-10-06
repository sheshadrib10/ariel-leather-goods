import { generateLocalEmbedding } from "./vector-math";

export interface Product {
  id: number;
  title: string;
  slug: string;
  category: "wallet" | "bag" | "belt" | "card_holder" | "accessory";
  subcategory: string;
  price_sgd: number;
  price_usd: number;
  material: string;
  leather_type: string;
  colour: string;
  colour_family: "brown" | "black" | "tan" | "burgundy" | "navy";
  hardware: string;
  style_tags: string[];
  recipient_tags: string[];
  use_cases: string[];
  features: string[];
  dimensions: string;
  weight_grams: number;
  in_stock: boolean;
  inventory_count: number;
  popularity_score: number; // 0-100
  margin_rate: number; // e.g. 70%
  rating: number;
  review_count: number;
  image_url: string;
  gallery_images: string[];
  description: string;
  craftsmanship_notes: string;
  search_text?: string;
  embedding?: number[];
}

export const INITIAL_PRODUCTS: Omit<Product, "embedding" | "search_text">[] = [
  {
    id: 1,
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
    features: [
      "RFID-Blocking Interior Lining",
      "8 Dedicated Card Slots",
      "Dual Full-Length Bill Compartments",
      "Hand-Burnished Waxed Edges",
      "Beveled Pocket Corners for Ease of Access"
    ],
    dimensions: "11.2 cm x 9.4 cm x 1.4 cm",
    weight_grams: 82,
    in_stock: true,
    inventory_count: 38,
    popularity_score: 98,
    margin_rate: 72,
    rating: 4.9,
    review_count: 142,
    image_url: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1559563458-527698bf5295?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Handcrafted in Florence from certified Tuscan full-grain calfskin, the Medici Bifold embodies refined discretion. Features hand-lacquered edges and an integrated RFID shield.",
    craftsmanship_notes: "Double-needle saddle stitched using German Serafil thread. The leather will develop a deep, lustrous patina with every passing year."
  },
  {
    id: 2,
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
    features: [
      "Fits iPad Pro 11-inch / Kindle Oasis",
      "Dedicated Passport & Boarding Pass Sleeve",
      "Elasticized Apple Pencil / Fountain Pen Loop",
      "4 Card Slots & Cash Sleeve",
      "Dual Snap Flap Closure"
    ],
    dimensions: "26.5 cm x 20.0 cm x 2.2 cm",
    weight_grams: 285,
    in_stock: true,
    inventory_count: 22,
    popularity_score: 92,
    margin_rate: 69,
    rating: 4.8,
    review_count: 89,
    image_url: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80"
    ],
    description: "An indispensable heirloom travel organizer. Carries your tablet, passport, foreign currency, and daily notes in a single compact Tuscan Vachetta folio.",
    craftsmanship_notes: "Untreated Vachetta leather tanned with mimosa and chestnut extracts, aging gracefully into a rich golden honey hue."
  },
  {
    id: 3,
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
    features: [
      "Ultra-Slim 4mm Profile",
      "4 Exterior Card Slots (2 on each side)",
      "Central Folded Note / Receipt Compartment",
      "RFID Shield Technology",
      "Hand-Creased Edges"
    ],
    dimensions: "10.0 cm x 7.2 cm x 0.4 cm",
    weight_grams: 34,
    in_stock: true,
    inventory_count: 54,
    popularity_score: 91,
    margin_rate: 76,
    rating: 4.9,
    review_count: 112,
    image_url: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80"
    ],
    description: "The epitome of pocket minimalism. Disappears effortlessly into slim-tailored suits while safeguarding your vital cards.",
    craftsmanship_notes: "Lined with supple French calfskin for silky card withdrawal."
  },
  {
    id: 4,
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
    features: [
      "Padded Sleeve Fits up to 16-inch MacBook Pro",
      "Dedicated Document Partition with Organizer Pockets",
      "Detachable Ergonomic Leather Shoulder Strap",
      "Rear Trolley Sleeve for Suitcase Stacking",
      "Protective Base Brass Studs"
    ],
    dimensions: "40.5 cm x 29.5 cm x 8.5 cm",
    weight_grams: 1420,
    in_stock: true,
    inventory_count: 12,
    popularity_score: 96,
    margin_rate: 65,
    rating: 5.0,
    review_count: 64,
    image_url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Engineered for high-stakes meetings and global transit. Constructed from resilient English bridle leather that holds structural rigidity year after year.",
    craftsmanship_notes: "Hand-molded handles filled with dense cord for comfortable all-day grip."
  },
  {
    id: 5,
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
    features: [
      "Separate Ventilated Shoe / Laundry Compartment",
      "Compliant with International Carry-on Overhead Bins",
      "Heavy-duty Two-Way Brass Excella Zippers",
      "Reinforced Riveted Handles & Padded Shoulder Pad",
      "Detachable Monogrammed Leather Luggage Tag"
    ],
    dimensions: "52.0 cm x 28.0 cm x 26.0 cm",
    weight_grams: 1950,
    in_stock: true,
    inventory_count: 8,
    popularity_score: 95,
    margin_rate: 64,
    rating: 4.9,
    review_count: 53,
    image_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80"
    ],
    description: "The definitive weekend companion. Cut from storied Horween Chromexcel leather that resists scuffs, scratches, and inclement weather.",
    craftsmanship_notes: "Waterproof herringbone cotton drill lining protects fine tailoring."
  },
  {
    id: 6,
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
    features: [
      "Reversible Swivel Mechanism for Dual Colours",
      "Beveled Feathered Edges with Hand-Painted Seal",
      "Custom Trimmable Length (fits waists up to 44 inches)",
      "5 Precision Teardrop Adjustment Holes",
      "Presented in Rigid Ariel Gift Box"
    ],
    dimensions: "3.2 cm width x 115 cm length",
    weight_grams: 165,
    in_stock: true,
    inventory_count: 45,
    popularity_score: 93,
    margin_rate: 70,
    rating: 4.8,
    review_count: 98,
    image_url: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=800&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Two timeless belts in one. A simple pull-and-twist rotates the brushed gunmetal buckle from rich espresso brown to formal onyx black.",
    craftsmanship_notes: "Triple-ply laminated leather construction ensures no stretching or creasing over time."
  },
  {
    id: 7,
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
    features: [
      "Modular Slide-in Rail System for Watches",
      "Protects up to 3 Timepieces (Dial sizes up to 46mm)",
      "Plush Velvet & Microfiber Anti-Tarnish Lining",
      "Flat Base for Sturdy Nightstand Display",
      "Rigid Walls Prevent Compression"
    ],
    dimensions: "22.5 cm x 10.0 cm x 7.5 cm",
    weight_grams: 340,
    in_stock: true,
    inventory_count: 18,
    popularity_score: 97,
    margin_rate: 71,
    rating: 4.9,
    review_count: 77,
    image_url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80"
    ],
    description: "The ultimate sanctuary for treasured mechanical timepieces. Designed with deep partition walls and a sliding cushion rail system that prevents watch crowns from touching.",
    craftsmanship_notes: "Saffiano crosshatch texture provides complete scratch and splash resistance during global travel."
  },
  {
    id: 8,
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
    features: [
      "Padded Compartment for 14-inch Laptop or iPad Pro",
      "Fidlock Magnetic Quick-Release Buckles",
      "Water-Resistant Technical Canvas Lining",
      "Rear Concealed Passport / Phone Zipper Pocket",
      "Adjustable Webbed Strap with Leather Shoulder Pad"
    ],
    dimensions: "36.0 cm x 27.0 cm x 9.0 cm",
    weight_grams: 980,
    in_stock: true,
    inventory_count: 15,
    popularity_score: 89,
    margin_rate: 67,
    rating: 4.8,
    review_count: 48,
    image_url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Designed for the urban commute. Supple pebbled calfskin drapes naturally against the hip while keeping electronics secure.",
    craftsmanship_notes: "Glove-tanned leather treated with natural waxes for weather repellency."
  },
  {
    id: 9,
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
    features: [
      "Securely Holds 2 Passports",
      "Boarding Pass & Currency Gusset",
      "Dedicated Micro-SIM and Pin Ejector Pockets",
      "Full RFID Blocking Shield",
      "6 Card Slots & Pen Holder"
    ],
    dimensions: "19.5 cm x 11.5 cm x 2.0 cm",
    weight_grams: 140,
    in_stock: true,
    inventory_count: 26,
    popularity_score: 88,
    margin_rate: 73,
    rating: 4.7,
    review_count: 59,
    image_url: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80"
    ],
    description: "All your travel documents under one secure zipper. Keeps foreign banknotes, passports, boarding passes, and SIM cards arranged with surgical precision.",
    craftsmanship_notes: "Infused with hot beeswax for a rugged water-resistant surface."
  },
  {
    id: 10,
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
    features: [
      "Integrated 15W Qi Fast Wireless Charging Coil",
      "Collapsible Snap Corners for Lay-Flat Travel",
      "Soft Suede Underside Protects Furniture",
      "Braided 1.5m USB-C Cable Included",
      "Embossed Ariel Crest Logo"
    ],
    dimensions: "22.0 cm x 18.0 cm x 3.5 cm",
    weight_grams: 190,
    in_stock: true,
    inventory_count: 31,
    popularity_score: 94,
    margin_rate: 68,
    rating: 4.9,
    review_count: 105,
    image_url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80"
    ],
    description: "The handsome drop zone for everyday essentials. Drop your phone to charge wirelessly while your keys, coins, and wedding band rest in Horween Dublin leather.",
    craftsmanship_notes: "Cut from thick 6oz Dublin hides that show natural grain variation and rich pull-up undertones."
  },
  {
    id: 11,
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
    features: [
      "Rare Shell Cordovan Equine Leather",
      "12 Hand-Cut Card Slots",
      "Gusseted Banknote Sleeve for Flat Notes",
      "Ultra-Slim Coat Profile (does not bulge jacket)",
      "Hand-Stitched Fil Au Chinois Linen Thread"
    ],
    dimensions: "18.8 cm x 9.5 cm x 1.0 cm",
    weight_grams: 95,
    in_stock: true,
    inventory_count: 10,
    popularity_score: 97,
    margin_rate: 62,
    rating: 5.0,
    review_count: 39,
    image_url: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Crafted from rare Shell Cordovan, famous for its non-creasing glass-like gloss and unmatched durability. Slips into inner breast pockets without disrupting tailored lines.",
    craftsmanship_notes: "Takes six months of artisanal tanning with vegetable liquors to produce a single cordovan shell."
  },
  {
    id: 12,
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
    features: [
      "Includes 3x 48-page Field Notes Graph Booklets",
      "Elasticized Pen Loop Fits Standard Fountain Pens",
      "Inside Card Slot for Business Cards",
      "Interior Bookmark Ribbon",
      "Distinctive Velvet-Matte Pueblo Finish"
    ],
    dimensions: "15.0 cm x 10.2 cm x 1.5 cm",
    weight_grams: 88,
    in_stock: true,
    inventory_count: 40,
    popularity_score: 87,
    margin_rate: 74,
    rating: 4.8,
    review_count: 61,
    image_url: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80"
    ],
    description: "The ideal gift for thoughtful note-takers and architects. Pueblo leather starts with a distinct rustic nap and patinas into a smooth, glossy dark amber.",
    craftsmanship_notes: "Tanned in Tuscany using centuries-old vacchetta methods."
  },
  {
    id: 13,
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
    features: [
      "Spring-Tension Steel Clip Grips up to 25 Bills",
      "6 Precision-Beveled Card Slots",
      "Quick-Access Thumb-Slide Exterior Slot",
      "RFID Protection Core",
      "Ultra-Compact Front Pocket Design"
    ],
    dimensions: "10.8 cm x 7.8 cm x 0.8 cm",
    weight_grams: 58,
    in_stock: true,
    inventory_count: 32,
    popularity_score: 92,
    margin_rate: 70,
    rating: 4.8,
    review_count: 84,
    image_url: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Engineered specifically for front-pocket carry. A tempered steel clip holds banknotes securely while maintaining half the thickness of traditional bifolds.",
    craftsmanship_notes: "Hand-lined with French Chèvre goatskin for zero-friction access."
  },
  {
    id: 14,
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
    features: [
      "Fidlock Magnetic Mechanical V-Buckle",
      "Concealed Anti-Theft Back Pocket for Passports",
      "Dedicated Sunglass / AirPods Pockets",
      "Integrated Retractable Key Tether",
      "Waterproof Coated Zippers"
    ],
    dimensions: "28.0 cm x 16.0 cm x 7.5 cm",
    weight_grams: 480,
    in_stock: true,
    inventory_count: 19,
    popularity_score: 86,
    margin_rate: 66,
    rating: 4.7,
    review_count: 42,
    image_url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Hands-free freedom crafted in butter-soft Italian Nappa leather. Features high-spec magnetic hardware for lightning-fast one-handed access.",
    craftsmanship_notes: "Reinforced with lightweight Kevlar webbing for slash protection."
  },
  {
    id: 15,
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
    features: [
      "Holds 2 to 7 Standard Keys Silently (No jingle)",
      "Integrated Apple AirTag Leather Pocket",
      "Dedicated D-Ring for Car Fob Attachment",
      "Includes Washer Spacers & Extension Screws",
      "Pocket-Friendly Smooth Profile"
    ],
    dimensions: "8.5 cm x 2.2 cm x 2.0 cm",
    weight_grams: 38,
    in_stock: true,
    inventory_count: 60,
    popularity_score: 91,
    margin_rate: 76,
    rating: 4.8,
    review_count: 120,
    image_url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Transforms noisy, bulky keyrings into an elegant, silent leather stack with seamless AirTag GPS location tracking.",
    craftsmanship_notes: "Crazy horse waxed leather rubs away minor scratches with the warmth of your fingertip."
  },
  {
    id: 16,
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
    features: [
      "Converts from Carry-On Duffle to Ergonomic Backpack",
      "Stowable Padded Air-Mesh Backpack Straps",
      "Side-Loading Padded 15.6-inch Laptop Chamber",
      "Expandable Side Pocket for Water Bottle / Tripod",
      "Reinforced Brass-Riveted Stress Points"
    ],
    dimensions: "48.0 cm x 30.0 cm x 20.0 cm",
    weight_grams: 1650,
    in_stock: true,
    inventory_count: 11,
    popularity_score: 94,
    margin_rate: 63,
    rating: 4.9,
    review_count: 57,
    image_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80"
    ],
    description: "The rugged chameleon of luggage. Carry it like an executive duffle or deploy the concealed backpack straps when walking through airports or cobblestone streets.",
    craftsmanship_notes: "Thick oil-tanned leather that repels rain and gains rugged character with journey miles."
  }
];

/**
 * Builds full search text and vector embedding for a product
 */
export function enrichProductWithEmbedding(p: Omit<Product, "embedding" | "search_text">): Product {
  const searchText = [
    p.title,
    p.category,
    p.subcategory,
    p.material,
    p.leather_type,
    p.colour,
    p.colour_family,
    p.style_tags.join(" "),
    p.recipient_tags.map(r => `for ${r}`).join(" "),
    p.use_cases.join(" "),
    p.features.join(" "),
    p.description,
    p.craftsmanship_notes
  ].join(" ");

  const embedding = generateLocalEmbedding(searchText);

  return {
    ...p,
    search_text: searchText,
    embedding
  };
}

export const PRODUCTS_CATALOG: Product[] = INITIAL_PRODUCTS.map(enrichProductWithEmbedding);
