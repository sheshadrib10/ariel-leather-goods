"use client";

import React, { useState } from "react";
import { X, Sparkles, UploadCloud, ArrowRight, Compass } from "lucide-react";

interface VisualSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteVisualSearch: (imageTitle: string, promptModifier: string) => void;
}

const SAMPLE_VISUAL_REFERENCES = [
  {
    title: "Italian Cognac Bifold Wallet",
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80",
    suggestedModifier: "Show me something like this but in black",
  },
  {
    title: "Executive Dark Brown Briefcase",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80",
    suggestedModifier: "Show me something similar for everyday commute under S$450",
  },
  {
    title: "Saddle Tan Weekender Duffle",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
    suggestedModifier: "Find matching travel accessories in tan Horween leather",
  },
  {
    title: "Artisan Leather Watch Roll",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80",
    suggestedModifier: "Premium leather gift for dad around S$200",
  },
];

export function VisualSearchModal({
  isOpen,
  onClose,
  onExecuteVisualSearch,
}: VisualSearchModalProps) {
  const [selectedReference, setSelectedReference] = useState(SAMPLE_VISUAL_REFERENCES[0]);
  const [modifier, setModifier] = useState(SAMPLE_VISUAL_REFERENCES[0].suggestedModifier);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onExecuteVisualSearch(selectedReference.title, modifier);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-ariel-cream border border-ariel-tan/40 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-500 hover:text-ariel-espresso p-1.5 rounded-full hover:bg-ariel-sand transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-ariel-espresso text-ariel-gold flex items-center justify-center">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-ariel-espresso">
              Visual Silhouette & Patina Matching
            </h3>
            <p className="text-xs text-ariel-saddle font-medium">
              Curate creations matching visual silhouette, leather texture, and aesthetic style
            </p>
          </div>
        </div>

        {/* Step 1: Select Visual Reference */}
        <div className="mb-5">
          <label className="block text-xs font-bold text-ariel-cognac uppercase tracking-wider mb-2">
            1. Select Reference Silhouette or Leather Tone:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {SAMPLE_VISUAL_REFERENCES.map((ref, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setSelectedReference(ref);
                  setModifier(ref.suggestedModifier);
                }}
                className={`group cursor-pointer rounded-xl overflow-hidden border-2 transition-all p-1 bg-white ${
                  selectedReference.title === ref.title
                    ? "border-ariel-amber ring-2 ring-ariel-amber/20 shadow-md"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <div className="aspect-square rounded-lg overflow-hidden mb-1">
                  <img
                    src={ref.image}
                    alt={ref.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <p className="text-[10px] font-bold text-ariel-espresso line-clamp-1 text-center">
                  {ref.title}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Step 2: Query Modifier */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-ariel-cognac uppercase tracking-wider mb-1">
              2. Add Bespoke Refinement:
            </label>
            <input
              type="text"
              value={modifier}
              onChange={(e) => setModifier(e.target.value)}
              placeholder='e.g., "Show me something like this but in black", "under S$200"'
              className="w-full bg-white border border-ariel-tan/40 rounded-xl px-4 py-3 text-xs sm:text-sm text-ariel-espresso focus:outline-none focus:ring-2 focus:ring-ariel-amber"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              Our bespoke match engine cross-references visual cuts, hand-burnished edges, and customer specifications.
            </p>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-ariel-sand transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-ariel-espresso hover:bg-ariel-cognac text-ariel-sand rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-ariel-gold" />
              <span>Execute Multimodal Discovery</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
