"use client";

import React from "react";
import { Star, ShieldCheck, CheckCircle2, MessageSquare } from "lucide-react";
import { INITIAL_REVIEWS } from "@/lib/reviews-data";

export function CustomerReviewsSection() {
  const featuredReviews = INITIAL_REVIEWS.slice(0, 4);

  return (
    <section id="reviews-section" className="py-16 sm:py-24 bg-ariel-cream border-b border-ariel-tan/20">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-ariel-saddle">
              Verified Patron Testimonials
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ariel-espresso">
              Patron Reviews &amp; Stories
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 max-w-xl">
              Authentic feedback from Singapore executives and international leather connoisseurs who carry Ariel every day.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-ariel-tan/30 shadow-xs">
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <div className="text-left">
              <span className="font-serif text-base font-bold text-ariel-espresso">4.9 / 5.0</span>
              <span className="text-[10px] text-gray-500 block">Across 600+ verified commissions</span>
            </div>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-3xl p-6 border border-ariel-tan/30 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                {/* Rating & Verified */}
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Verified</span>
                  </span>
                </div>

                <h4 className="font-serif text-sm font-bold text-ariel-espresso leading-snug">
                  &ldquo;{rev.title}&rdquo;
                </h4>

                <p className="text-xs text-gray-600 leading-relaxed line-clamp-4">
                  {rev.content}
                </p>
              </div>

              {/* Author & Monogram Detail */}
              <div className="pt-3 border-t border-ariel-tan/15 text-[11px] space-y-1">
                <div className="font-bold text-ariel-espresso flex items-center justify-between">
                  <span>{rev.author_name}</span>
                  <span className="text-gray-400 text-[10px]">{rev.author_location}</span>
                </div>
                {rev.monogram_ordered && (
                  <p className="text-[10px] text-amber-900 font-serif">
                    Monogram: <strong>{rev.monogram_ordered}</strong>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
