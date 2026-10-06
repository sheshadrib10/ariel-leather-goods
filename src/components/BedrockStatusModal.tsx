"use client";

import React, { useEffect, useState } from "react";
import { X, CheckCircle2, Cpu, Database, Zap, DollarSign, Layers, ArrowRight } from "lucide-react";

interface BedrockStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BedrockStatusModal({ isOpen, onClose }: BedrockStatusModalProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/bedrock-status")
        .then((res) => res.json())
        .then((d) => {
          setData(d);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-ariel-cream border border-ariel-tan/40 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-ariel-cognac/60 hover:text-ariel-espresso p-1.5 rounded-full hover:bg-ariel-sand transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-ariel-espresso text-ariel-gold flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-ariel-espresso">
              Amazon Bedrock + pgvector Architecture
            </h2>
            <p className="text-xs text-ariel-saddle font-medium">
              Ariel Leather Goods Autonomous Discovery Layer
            </p>
          </div>
        </div>

        {/* Live Status Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-white/80 border border-ariel-tan/30 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-ariel-espresso uppercase tracking-wider">
                Amazon Bedrock Models
              </h4>
              <p className="text-xs text-gray-600 mt-0.5">
                • Intent: <span className="font-mono text-ariel-cognac">amazon.nova-micro-v1:0</span>
              </p>
              <p className="text-xs text-gray-600">
                • Embeddings: <span className="font-mono text-ariel-cognac">amazon.titan-embed-text-v2:0</span>
              </p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                Region: us-east-1 (Adapter Online)
              </div>
            </div>
          </div>

          <div className="bg-white/80 border border-ariel-tan/30 rounded-xl p-4 flex items-start gap-3">
            <Database className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-ariel-espresso uppercase tracking-wider">
                PostgreSQL + pgvector
              </h4>
              <p className="text-xs text-gray-600 mt-0.5">
                • Dimension: <span className="font-mono font-bold text-ariel-cognac">1024-D</span> vector cosine
              </p>
              <p className="text-xs text-gray-600">
                • Index: <span className="font-mono text-ariel-cognac">HNSW (vector_cosine_ops)</span>
              </p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-100 text-sky-800">
                PostgreSQL 17.11 / vector 0.8.6
              </div>
            </div>
          </div>
        </div>

        {/* Two-Model Architecture Flow */}
        <div className="bg-ariel-sand/50 border border-ariel-tan/30 rounded-xl p-5 mb-6">
          <h3 className="text-xs font-bold tracking-wider uppercase text-ariel-cognac mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-ariel-amber" />
            The Two-Model Bedrock Search Pipeline
          </h3>

          <div className="space-y-3 text-xs">
            {/* Step 1 */}
            <div className="bg-white p-3 rounded-lg border border-ariel-tan/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-ariel-espresso text-ariel-gold text-[10px] font-bold flex items-center justify-center">1</span>
                <div>
                  <span className="font-bold text-ariel-espresso">Model 1: Amazon Nova Micro / Lite</span>
                  <p className="text-gray-500 text-[11px]">Understands customer intent & extracts JSON attributes</p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-ariel-saddle bg-ariel-sand px-2 py-1 rounded">
                Query &rarr; Category, Recipient, Max Price
              </span>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-3 rounded-lg border border-ariel-tan/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-ariel-espresso text-ariel-gold text-[10px] font-bold flex items-center justify-center">2</span>
                <div>
                  <span className="font-bold text-ariel-espresso">Model 2: Nova Multimodal / Titan Text V2</span>
                  <p className="text-gray-500 text-[11px]">Embeds distilled search concepts into 1024-D vector</p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-ariel-saddle bg-ariel-sand px-2 py-1 rounded">
                Intent &rarr; Dense Vector &rarr; pgvector (&lt;=&gt;)
              </span>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-3 rounded-lg border border-ariel-tan/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-ariel-espresso text-ariel-gold text-[10px] font-bold flex items-center justify-center">3</span>
                <div>
                  <span className="font-bold text-ariel-espresso">PostgreSQL Multi-Factor Re-Ranking</span>
                  <p className="text-gray-500 text-[11px]">Combines 5 business and semantic signals</p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-ariel-cognac bg-ariel-sand px-2 py-1 rounded font-bold">
                40% Semantic + 30% Exact + 15% Pop + 10% Stock + 5% Margin
              </span>
            </div>
          </div>
        </div>

        {/* Cost Analysis Box */}
        <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-5 mb-6 text-xs text-amber-900">
          <h3 className="font-bold uppercase tracking-wider text-amber-950 flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-amber-700" />
            Amazon Bedrock Token Economics (At Our Scale)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-white/80 p-3 rounded-lg border border-amber-200/60">
              <p className="font-bold text-amber-950">Titan Text Embeddings V2</p>
              <p className="text-gray-600 mt-0.5">$0.02 per million input tokens</p>
              <p className="text-amber-800 font-semibold mt-1">
                5,000 products &times; 300 tokens = ~1.5M tokens &approx; <span className="underline">$0.03 one-time!</span>
              </p>
            </div>
            <div className="bg-white/80 p-3 rounded-lg border border-amber-200/60">
              <p className="font-bold text-amber-950">Amazon Nova Micro (Intent LLM)</p>
              <p className="text-gray-600 mt-0.5">$0.000035 / 1K in, $0.00014 / 1K out</p>
              <p className="text-amber-800 font-semibold mt-1">
                Average cost per customer query &approx; <span className="underline">$0.000005</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-ariel-espresso text-ariel-sand rounded-xl text-xs font-semibold tracking-wider uppercase hover:bg-ariel-saddle transition-colors"
          >
            Close Architecture Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
