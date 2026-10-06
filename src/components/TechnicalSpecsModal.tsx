"use client";

import React, { useState, useEffect } from "react";
import { X, Cpu, Database, DollarSign, Layers, CheckCircle2, ShieldCheck, Zap } from "lucide-react";

interface TechnicalSpecsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TechnicalSpecsModal({ isOpen, onClose }: TechnicalSpecsModalProps) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/bedrock-status")
        .then((r) => r.json())
        .then(setData)
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-ariel-cream border border-ariel-tan/40 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-ariel-espresso p-1.5 rounded-full hover:bg-ariel-sand transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-ariel-espresso text-ariel-gold flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-ariel-espresso">
              Architecture & Bedrock Technical Blueprint
            </h3>
            <p className="text-xs text-ariel-saddle font-medium">
              Enterprise Stack: Medusa eCommerce Engine + AWS Bedrock + PostgreSQL 17 pgvector
            </p>
          </div>
        </div>

        {/* Live System Diagnostics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 rounded-2xl border border-ariel-tan/30 space-y-1 text-xs">
            <div className="flex items-center gap-2 font-bold text-ariel-espresso uppercase text-[11px]">
              <Zap className="w-4 h-4 text-emerald-600" />
              <span>Amazon Bedrock Adapter</span>
            </div>
            <p className="text-gray-600">Intent Model: <code className="font-mono text-ariel-cognac">amazon.nova-micro-v1:0</code></p>
            <p className="text-gray-600">Embeddings: <code className="font-mono text-ariel-cognac">amazon.titan-embed-text-v2:0</code></p>
            <p className="text-gray-600">Multimodal: <code className="font-mono text-ariel-cognac">amazon.nova-embed-multimodal-v1:0</code></p>
            <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
              Region: us-east-1 (Adapter Online)
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-ariel-tan/30 space-y-1 text-xs">
            <div className="flex items-center gap-2 font-bold text-ariel-espresso uppercase text-[11px]">
              <Database className="w-4 h-4 text-sky-600" />
              <span>PostgreSQL 17 + pgvector</span>
            </div>
            <p className="text-gray-600">Dimensionality: <span className="font-bold text-ariel-espresso">1024-D</span> unit vectors</p>
            <p className="text-gray-600">Index Type: <span className="font-mono text-ariel-espresso">HNSW (vector_cosine_ops)</span></p>
            <p className="text-gray-600">Distance Metric: <span className="font-mono text-ariel-espresso">&lt;=&gt; Cosine Distance</span></p>
            <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800">
              Port 5432 &bull; 16 Seeded Creations
            </span>
          </div>
        </div>

        {/* Medusa Module Integrations */}
        <div className="bg-white p-5 rounded-2xl border border-ariel-tan/30 mb-6 text-xs space-y-3">
          <h4 className="font-bold text-ariel-cognac uppercase tracking-wider text-[11px] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-ariel-amber" />
            Active Medusa eCommerce Modules
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-ariel-sand/30 p-3 rounded-xl">
              <span className="font-bold text-ariel-espresso block">1. Multi-Region & Tax</span>
              <p className="text-gray-500 text-[11px] mt-0.5">
                Singapore GST (9%) tax-inclusive, USD export, and EUR VAT pricing models.
              </p>
            </div>
            <div className="bg-ariel-sand/30 p-3 rounded-xl">
              <span className="font-bold text-ariel-espresso block">2. Carts & Checkout Engine</span>
              <p className="text-gray-500 text-[11px] mt-0.5">
                Cart session lifecycle, shipping calculation, and PayNow QR / Stripe payment sessions.
              </p>
            </div>
            <div className="bg-ariel-sand/30 p-3 rounded-xl">
              <span className="font-bold text-ariel-espresso block">3. Promotions & Discounts</span>
              <p className="text-gray-500 text-[11px] mt-0.5">
                Codes: <code className="font-mono font-bold">ARIEL10</code> (10% off), <code className="font-mono font-bold">SINGAPORE25</code> (S$25 off &gt; S$150).
              </p>
            </div>
            <div className="bg-ariel-sand/30 p-3 rounded-xl">
              <span className="font-bold text-ariel-espresso block">4. Orders, RMA & Warranty</span>
              <p className="text-gray-500 text-[11px] mt-0.5">
                Live order tracking and complimentary lifetime stitching repair booking service.
              </p>
            </div>
          </div>
        </div>

        {/* 5-Factor Ranking Formula */}
        <div className="bg-amber-50/70 p-5 rounded-2xl border border-amber-200/80 mb-6 text-xs text-amber-950 space-y-2">
          <h4 className="font-bold uppercase tracking-wider text-[11px] flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-700" />
            Multi-Factor Re-Ranking Formula
          </h4>
          <p className="font-mono bg-white/80 p-2.5 rounded-lg border border-amber-200 text-amber-950 font-bold">
            Final Score = 0.40 &times; Semantic + 0.30 &times; ExactFilters + 0.15 &times; Popularity + 0.10 &times; Inventory + 0.05 &times; Margin
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
            <div><span className="text-gray-500">Semantic: </span><b>40%</b></div>
            <div><span className="text-gray-500">Attributes: </span><b>30%</b></div>
            <div><span className="text-gray-500">Popularity: </span><b>15%</b></div>
            <div><span className="text-gray-500">Inventory: </span><b>10%</b></div>
          </div>
        </div>

        {/* Published Pricing */}
        <div className="bg-white p-4 rounded-2xl border border-ariel-tan/30 mb-6 text-xs text-gray-600 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold text-ariel-espresso">Bedrock Pricing (Titan Embeddings V2)</p>
              <p className="text-[11px]">$0.02 per 1,000,000 tokens &bull; Full 5,000-item catalogue embedding &approx; $0.03 one-time!</p>
            </div>
          </div>
          <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
            ~$0.000005 / query
          </span>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-ariel-espresso text-ariel-sand rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-ariel-saddle transition-colors"
          >
            Close Blueprint
          </button>
        </div>
      </div>
    </div>
  );
}

