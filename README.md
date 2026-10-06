# Ariel Leather Goods ⚜️
### Artisanal Italian Craftsmanship meets Amazon Bedrock Hybrid Semantic Search

A production-ready luxury leather goods eCommerce platform crafted for **Ariel Leather Goods**. Powered by **Amazon Bedrock (Amazon Nova Micro + Titan Text Embeddings V2 / Nova Multimodal)** and **PostgreSQL with pgvector**, providing sub-second semantic discovery, structured attribute extraction, and multi-factor re-ranking.

---

## 🏛️ Architecture Overview

```
                      CUSTOMER
                         │
                         ▼
 "I need a premium-looking leather gift for my dad, around S$200,
                 preferably something he can use every day"
                         │
                         ▼
                  ┌──────────────┐
                  │ Query Router │
                  └──────┬───────┘
           ┌─────────────┴─────────────┐
           │                           │
  [Simple keyword: "wallet"]   [Conversational Intent]
           │                           │
           ▼                           ▼
   Fast Catalog Index          ┌──────────────┐
           │                   │ Amazon Nova  │
           │                   │  Micro/Lite  │
           │                   └──────┬───────┘
           │                          │ Extracts structured JSON intent:
           │                          │ { category: "wallet", max_price: 200,
           │                          │   recipient: "father", use: "everyday" }
           │                          ▼
           │                   ┌──────────────────┐
           │                   │ Titan Text V2 /  │
           │                   │ Nova Multimodal  │
           │                   └──────┬───────────┘
           │                          │ 1024-D dense vector
           │                          ▼
           └──────────────────►┌──────────────────┐
                               │  PostgreSQL 17   │
                               │   + pgvector     │
                               └──────┬───────────┘
                                      │ Vector cosine distance (<=>)
                                      │ + SQL metadata filters
                                      ▼
                               ┌──────────────────┐
                               │ Multi-Factor     │
                               │ Re-Ranking Engine│
                               └──────┬───────────┘
                                      │
                                      ▼
                               TOP 10 CREATIONS
```

---

## ⚖️ The Multi-Factor Re-Ranking Formula

Every search candidate is scored dynamically according to five core dimensions:

$$\text{Final Score} = 0.40 \times \text{Semantic} + 0.30 \times \text{FilterMatch} + 0.15 \times \text{Popularity} + 0.10 \times \text{Inventory} + 0.05 \times \text{Margin}$$

- **40% Semantic Relevance**: Cosine similarity $(1 - (\text{embedding} \Leftrightarrow \text{query\_vec}))$ in 1024-D space.
- **30% Exact Filter Match**: Attribute adherence (Category, Budget $\le \text{S}\$200$, Recipient: Father, Occasion: Gift, Material: Full-Grain Leather).
- **15% Popularity**: Historical customer interest and review ratings.
- **10% Inventory**: Stock level weighting, prioritizing ready-to-ship pieces over near-exhausted stock.
- **5% Margin Rules**: Merchant gross margin weighting.

---

## 💰 Bedrock Token Economics (At Luxury Catalogue Scale)

- **Amazon Titan Text Embeddings V2**: Listed at **$0.02 per million input tokens**.
  - $5,000\text{ products} \times 300\text{ tokens} = 1.5\text{ million tokens} \approx \mathbf{\$0.03}$ **one-time catalogue embedding cost**!
- **Amazon Nova Micro**:
  - Input: $0.000035 / 1\text{K tokens}$
  - Output: $0.000140 / 1\text{K tokens}$
  - Average cost per customer query intent extraction: $\mathbf{\approx \$0.000005}$!

---

## 📦 What's Included

1. **Curated Handcrafted Catalogue**: 16 artisanal creations (Medici Bifold, Sarto Briefcase, Riviera Duffle, Aurelius Reversible Belt, Triple Watch Roll, AirTag Key Organizers, Valet Trays, etc.) with prices in **SGD (S$) and USD ($)**.
2. **Dual-Path Search**:
   - `wallet` $\rightarrow$ Fast sub-millisecond keyword index path.
   - `I need a premium-looking leather gift for my dad, around S$200` $\rightarrow$ Amazon Nova structured intent + Bedrock embeddings.
3. **Multimodal Visual Discovery**: "Show me something like this but in black" visual reference matching.
4. **Interactive AI Reasoning Drawer**: Real-time trace showing extracted intent attributes, applied SQL filters, and ranking formula weights.
5. **PostgreSQL 17 + pgvector**: Native 1024-dimensional vector cosine distance indices (`HNSW`).
6. **Luxury UI**: Warm cream, espresso, saddle tan, and gold accents built with Next.js 14, Tailwind CSS, and Lucide icons.

---

## 🚀 Quick Start (Local)

### 1. Start Database & App via Docker Compose

```bash
docker compose up -d
```

### 2. Or Run Locally with Node.js

```bash
# Install dependencies
npm install

# Seed PostgreSQL + pgvector
npm run seed

# Start production server
npm run build
npm run start
```

Visit: `http://localhost:3000`

---

## ☁️ AWS Cloud Stack

- **CloudFront**: Edge caching and SSL termination.
- **Next.js**: Containerized on **AWS App Runner** or **Amazon ECS Fargate**.
- **PostgreSQL + pgvector**: **Amazon Aurora Serverless v2 PostgreSQL** with `vector` extension.
- **Amazon Bedrock**:
  - `amazon.nova-micro-v1:0` (Intent parsing)
  - `amazon.titan-embed-text-v2:0` / `amazon.nova-embed-multimodal-v1:0` (Embeddings)
- **Amazon S3**: High-resolution leather product photography.
- **Amazon SES**: Transactional order confirmation emails.
