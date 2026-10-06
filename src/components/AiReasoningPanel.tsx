"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Cpu, Filter, Sparkles, BarChart3, Clock, DollarSign, Check } from "lucide-react";
import { SearchResult } from "@/lib/search-engine";

interface AiReasoningPanelProps {
  searchResult: SearchResult | null;
}

export function AiReasoningPanel({ searchResult }: AiReasoningPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!searchResult) return null;

  const { search_mode, execution_steps, intent, latency_ms } = searchResult;
  const isAi = search_mode === "AI_INTENT_SEMANTIC" || search_mode === "HYBRID_ATTRIBUTED";

  return (
    <div className="container mx-auto px-4 max-w-6xl my-6">
      <div className="bg-gradient-to-r from-amber-50/90 via-orange-50/50 to-amber-50/90 border border-ariel-amber/40 rounded-2xl p-4 sm:p-5 shadow-sm">
        {/* Panel Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-ariel-espresso text-ariel-gold flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-ariel-espresso uppercase tracking-wider">
                  Bedrock Execution Trace
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  isAi ? "bg-purple-100 text-purple-900 border border-purple-300" : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                }`}>
                  {search_mode.replace(/_/g, " ")}
                </span>
              </div>
              <p className="text-xs text-ariel-saddle font-medium">
                Query: &ldquo;<span className="italic font-semibold">{searchResult.query || "All Products"}</span>&rdquo;
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-ariel-cognac">
            <div className="flex items-center gap-1.5 bg-white/80 px-2.5 py-1 rounded-lg border border-ariel-tan/20">
              <Clock className="w-3.5 h-3.5 text-ariel-amber" />
              <span>{latency_ms} ms</span>
            </div>
            {intent?.provider_info?.cost_usd !== undefined && (
              <div className="flex items-center gap-1.5 bg-white/80 px-2.5 py-1 rounded-lg border border-ariel-tan/20">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>${intent.provider_info.cost_usd.toFixed(6)} est.</span>
              </div>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-ariel-cognac hover:text-ariel-espresso rounded-lg hover:bg-white/80 transition-colors"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Collapsible Steps */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-ariel-amber/20 grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            {/* Step 1: Nova Intent */}
            <div className="bg-white/90 p-3.5 rounded-xl border border-ariel-tan/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold uppercase tracking-wider text-[11px] text-ariel-espresso flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-ariel-amber" />
                    Step 1: Nova Intent
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    execution_steps.step_1_intent.status === "completed" ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"
                  }`}>
                    {execution_steps.step_1_intent.status}
                  </span>
                </div>
                {intent ? (
                  <div className="space-y-1 font-mono text-[11px] text-gray-700 bg-ariel-sand/30 p-2 rounded">
                    <div><span className="text-gray-500">category:</span> {intent.category.join(", ") || "any"}</div>
                    <div><span className="text-gray-500">max_price:</span> {intent.max_price ? `S$${intent.max_price}` : "none"}</div>
                    <div><span className="text-gray-500">recipient:</span> {intent.recipient || "any"}</div>
                    <div><span className="text-gray-500">use_case:</span> {intent.use_case || "everyday"}</div>
                    <div><span className="text-gray-500">style:</span> {intent.style.join(", ") || "premium"}</div>
                  </div>
                ) : (
                  <p className="text-gray-500 italic text-[11px]">Exact keyword match bypassed LLM intent step.</p>
                )}
              </div>
              <p className="text-[10px] text-gray-400 mt-2 font-mono">Model: Nova Micro</p>
            </div>

            {/* Step 2: SQL Filters */}
            <div className="bg-white/90 p-3.5 rounded-xl border border-ariel-tan/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold uppercase tracking-wider text-[11px] text-ariel-espresso flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-sky-600" />
                    Step 2: SQL Filters
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Active
                  </span>
                </div>
                <div className="space-y-1 text-[11px] text-gray-700">
                  {execution_steps.step_2_sql_filters.applied_filters.map((f, i) => (
                    <div key={i} className="flex items-start gap-1 font-mono bg-sky-50/50 px-1.5 py-0.5 rounded text-sky-950">
                      <Check className="w-3 h-3 text-sky-600 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                  <div className="text-[10px] text-gray-500 mt-1">
                    Filtered out: {execution_steps.step_2_sql_filters.filtered_out_count} non-matching items
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 mt-2 font-mono">Engine: PostgreSQL 17</p>
            </div>

            {/* Step 3: Semantic Embeddings */}
            <div className="bg-white/90 p-3.5 rounded-xl border border-ariel-tan/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold uppercase tracking-wider text-[11px] text-ariel-espresso flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    Step 3: Vector Space
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    execution_steps.step_3_semantic_search.status === "completed" ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"
                  }`}>
                    {execution_steps.step_3_semantic_search.status}
                  </span>
                </div>
                <div className="space-y-1 text-[11px] text-gray-700">
                  <div className="text-[10px] text-purple-900 font-medium">
                    Vector Distance: <span className="font-mono">&lt;=&gt; cosine</span>
                  </div>
                  <div className="text-[10px] text-gray-600">
                    Dimensions: <span className="font-mono font-bold">1024-D</span>
                  </div>
                  {execution_steps.step_3_semantic_search.phrase_embedded && (
                    <div className="bg-purple-50 p-1.5 rounded text-[10px] text-purple-950 font-mono italic">
                      &ldquo;{execution_steps.step_3_semantic_search.phrase_embedded}&rdquo;
                    </div>
                  )}
                </div>
              </div>
              <p className="text-[10px] text-gray-400 mt-2 font-mono">Model: Titan Text V2</p>
            </div>

            {/* Step 4: Multi-Factor Re-Ranking */}
            <div className="bg-white/90 p-3.5 rounded-xl border border-ariel-tan/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold uppercase tracking-wider text-[11px] text-ariel-espresso flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5 text-amber-600" />
                    Step 4: Re-Ranking
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Formula Active
                  </span>
                </div>
                <div className="space-y-1 text-[10px] font-mono">
                  <div className="flex justify-between items-center text-amber-950">
                    <span>Semantic Similarity:</span>
                    <span className="font-bold text-amber-800">40%</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-700">
                    <span>Exact Attribute Filters:</span>
                    <span className="font-bold">30%</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-700">
                    <span>Product Popularity:</span>
                    <span className="font-bold">15%</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-700">
                    <span>Inventory Level:</span>
                    <span className="font-bold">10%</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-700">
                    <span>Gross Margin Rules:</span>
                    <span className="font-bold">5%</span>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 mt-2 font-mono">Postgres Hybrid SQL</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
