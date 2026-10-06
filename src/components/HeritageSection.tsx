"use client";

import React from "react";
import { Shield, Sparkles, Award, MapPin } from "lucide-react";

export function HeritageSection() {
  return (
    <section className="bg-ariel-sand/40 border-t border-b border-ariel-tan/20 py-16 sm:py-24">
      <div className="container mx-auto max-w-7xl px-4 space-y-16">
        {/* Editorial Quote */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-ariel-saddle">
            The Philosophy of Ariel
          </span>
          <blockquote className="font-serif text-2xl sm:text-3xl text-ariel-espresso italic leading-snug">
            &ldquo;True luxury does not shout. It reveals itself in the tempered snap of solid brass,
            the honeyed patina of full-grain Tuscan hides, and the enduring precision of every hand-burnished edge.&rdquo;
          </blockquote>
          <p className="text-xs text-gray-500 font-semibold tracking-wider uppercase">
            &mdash; Robb Report Editorial Feature &bull; The New Quiet Luxury
          </p>
        </div>

        {/* 3 Heritage Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Pillar 1 */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-ariel-tan/30 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-ariel-sand flex items-center justify-center text-ariel-cognac">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="font-serif text-lg font-bold text-ariel-espresso">
              Certified Tuscan Consortium
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Every hide originates from historical tanneries along the Arno river basin in Tuscany,
              tanned slowly over 60 days using natural chestnut and mimosa bark extracts.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-ariel-tan/30 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-ariel-sand flex items-center justify-center text-ariel-cognac">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="font-serif text-lg font-bold text-ariel-espresso">
              Bespoke Hot-Stamping
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Complimentary personalized monogramming rendered in 24k gold foil, fine silver, or subtle blind debossing
              using curated brass serif letterpress type.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-ariel-tan/30 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-ariel-sand flex items-center justify-center text-ariel-cognac">
              <MapPin className="w-5 h-5" />
            </div>
            <h4 className="font-serif text-lg font-bold text-ariel-espresso">
              Singapore Concierge Service
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Dispatched with white-glove courier directly from our Singapore distribution hub.
              Same-day delivery across Tanglin, Marina Bay, Orchard, and Sentosa Cove.
            </p>
          </div>
        </div>

        {/* Flagship Boutiques Ribbon */}
        <div className="bg-ariel-espresso text-ariel-sand rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-[10px] font-bold text-ariel-gold tracking-widest uppercase">
              By Appointment & Online Atelier
            </span>
            <h4 className="font-serif text-xl sm:text-2xl font-bold text-white">
              Ariel Private Salon Singapore
            </h4>
            <p className="text-xs text-gray-400">
              10 Bayfront Avenue, Marina Bay Sands, Singapore 018956 &bull; Private Consultations Daily
            </p>
          </div>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="px-6 py-3 bg-ariel-gold text-ariel-espresso rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors shrink-0 shadow-sm"
          >
            Explore Available Creations
          </button>
        </div>
      </div>
    </section>
  );
}
