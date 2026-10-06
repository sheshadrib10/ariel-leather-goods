import { ProductReview } from "./medusa/types";

export const INITIAL_REVIEWS: ProductReview[] = [
  {
    id: "rev_01",
    product_id: 1,
    product_slug: "medici-bifold-wallet-espresso",
    author_name: "Alexander Tan",
    author_location: "Nassim Road, Singapore",
    rating: 5,
    title: "The Florentine calfskin is extraordinary",
    content:
      "Having collected leather goods from Hermès and Berluti, the Medici Bifold stands shoulder to shoulder in leather density and edge burnishing. The 24k gold hot-stamping 'AT' done at the Marina Bay Sands atelier is razor-sharp. Fits Singapore S$50 notes with ease without bulging.",
    verified_purchase: true,
    monogram_ordered: "AT (24k Gold)",
    created_at: "2026-09-28T14:30:00Z",
    merchant_reply: {
      author: "Master Craftsman Ariel",
      content:
        "Grazie mille, Alexander. We hand-select only Tuscan Vachetta culatta for the Medici bifold. With daily Singapore carry, the vegetable oils will yield a deep chestnut sheen.",
      created_at: "2026-09-29T09:15:00Z",
    },
  },
  {
    id: "rev_02",
    product_id: 1,
    product_slug: "medici-bifold-wallet-espresso",
    author_name: "Keith Wong",
    author_location: "Orchard Boulevard, Singapore",
    rating: 5,
    title: "Discreet quiet luxury without obnoxious logos",
    content:
      "Ordered via HitPay PayNow at 10 AM, and the EasyParcel same-day white-glove courier delivered the emerald gift box to my office by 2 PM. RFID shield works reliably at MRT tap points while protecting credit cards.",
    verified_purchase: true,
    monogram_ordered: "KW (Blind Deboss)",
    created_at: "2026-10-02T16:20:00Z",
  },
  {
    id: "rev_03",
    product_id: 1,
    product_slug: "medici-bifold-wallet-espresso",
    author_name: "David Chen",
    author_location: "Tanjong Pagar, Singapore",
    rating: 4,
    title: "Superb leather stiffness, breaks in wonderfully",
    content:
      "Slightly tight card slots on day one as expected of genuine vegetable-tanned calfskin. After a week of carry, the leather softened to hug all 8 cards perfectly.",
    verified_purchase: true,
    monogram_ordered: "DC (24k Gold)",
    created_at: "2026-10-04T11:05:00Z",
  },
  {
    id: "rev_04",
    product_id: 2,
    product_slug: "heritage-travel-folio-cognac",
    author_name: "Rachel Lim",
    author_location: "Bukit Timah, Singapore",
    rating: 5,
    title: "The ultimate Singapore Changi executive travel companion",
    content:
      "Comfortably holds my iPad Pro 11-inch, passport, Apple Pencil, and business cards. The antique brass snaps have a satisfying heavy click. Untreated Tuscan Vachetta is already beginning its honey patina.",
    verified_purchase: true,
    monogram_ordered: "RL (24k Gold)",
    created_at: "2026-09-20T08:45:00Z",
  },
  {
    id: "rev_05",
    product_id: 3,
    product_slug: "verona-slim-card-sleeve-black",
    author_name: "Marcus Neo",
    author_location: "Raffles Place, Singapore",
    rating: 5,
    title: "Ultra-thin 4mm profile for tailored suits",
    content:
      "Completely undetectable in the breast pocket of an Italian tailored suit. French Chèvre goatskin grain is scratch-resistant and supple.",
    verified_purchase: true,
    monogram_ordered: "MN (Silver Foil)",
    created_at: "2026-09-24T12:10:00Z",
  },
  {
    id: "rev_06",
    product_id: 4,
    product_slug: "sarto-executive-leather-briefcase-dark-brown",
    author_name: "Somnath B.",
    author_location: "Marina Bay Residences, Singapore",
    rating: 5,
    title: "Flawless English bridle leather and brass hardware",
    content:
      "Fits my 16-inch MacBook Pro with dedicated padding. The trolley sleeve on the rear made my recent Singapore-Tokyo flight effortless. Pure sartorial excellence.",
    verified_purchase: true,
    monogram_ordered: "SB (24k Gold)",
    created_at: "2026-10-01T17:50:00Z",
    merchant_reply: {
      author: "Master Craftsman Ariel",
      content:
        "A pleasure, Somnath. The bridle leather was wax-stuffed in drums for 3 months to withstand humidity while retaining its architectural silhouette.",
      created_at: "2026-10-02T10:00:00Z",
    },
  },
  {
    id: "rev_07",
    product_id: 7,
    product_slug: "grand-tourer-triple-watch-roll-espresso",
    author_name: "Claire Dupont",
    author_location: "Sentosa Cove, Singapore",
    rating: 5,
    title: "Houses 42mm luxury chronographs without crown friction",
    content:
      "The slide-in rail system ensures each timepiece stays anchored during travel. The emerald microsuede interior protects polished bezel surfaces flawlessly.",
    verified_purchase: true,
    monogram_ordered: "CD (Silver Foil)",
    created_at: "2026-10-03T10:30:00Z",
  },
  {
    id: "rev_08",
    product_id: 10,
    product_slug: "valet-catchall-wireless-charger-tray",
    author_name: "Jonathan Lee",
    author_location: "River Valley, Singapore",
    rating: 5,
    title: "A gorgeous desk centerpiece with fast Qi charging",
    content:
      "Charges my iPhone 16 Pro through a leather case without heating up. Horween Dublin leather has a rich pull-up effect with character in every fold.",
    verified_purchase: true,
    monogram_ordered: "JL (Blind Deboss)",
    created_at: "2026-10-05T09:12:00Z",
  },
];

const REVIEWS_STORAGE_KEY = "ariel_product_reviews_v2";

export function getStoredReviews(): ProductReview[] {
  if (typeof window === "undefined") return INITIAL_REVIEWS;
  try {
    const raw = localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(INITIAL_REVIEWS));
      return INITIAL_REVIEWS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_REVIEWS;
  }
}

export function saveStoredReviews(reviews: ProductReview[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
  } catch (e) {
    console.warn("Failed saving reviews:", e);
  }
}

export function getReviewsForProduct(productId: number, slug?: string): ProductReview[] {
  const all = getStoredReviews();
  return all.filter(
    (r) => r.product_id === productId || (slug && r.product_slug.toLowerCase() === slug.toLowerCase())
  );
}

export function addReviewToProduct(
  newReviewData: Omit<ProductReview, "id" | "created_at">
): ProductReview {
  const all = getStoredReviews();
  const created: ProductReview = {
    ...newReviewData,
    id: `rev_${Date.now()}`,
    created_at: new Date().toISOString(),
  };
  const updated = [created, ...all];
  saveStoredReviews(updated);
  return created;
}

export function replyToReview(reviewId: string, replyContent: string): void {
  const all = getStoredReviews();
  const idx = all.findIndex((r) => r.id === reviewId);
  if (idx !== -1) {
    all[idx].merchant_reply = {
      author: "Master Craftsman Ariel",
      content: replyContent,
      created_at: new Date().toISOString(),
    };
    saveStoredReviews(all);
  }
}
