"use client";

import React, { useState } from "react";
import {
  Share2,
  Copy,
  Check,
  X,
  Send,
  MessageCircle,
  Facebook,
  Twitter,
  Mail,
  ExternalLink,
} from "lucide-react";
import { Product } from "@/lib/catalog-data";
import { RankedProduct } from "@/lib/search-engine";

interface ShareButtonsProps {
  product: Product | RankedProduct;
  variant?: "button" | "icon" | "inline";
  className?: string;
}

export function ShareButtons({ product, variant = "button", className = "" }: ShareButtonsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Derive canonical URL
  const getShareUrl = () => {
    if (typeof window === "undefined") return `https://ariel-leather-goods.pages.dev/products/${product.slug}`;
    const origin = window.location.origin;
    return `${origin}/products/${product.slug}`;
  };

  const shareTitle = `${product.title} • Ariel Leather Goods Singapore`;
  const shareText = `Discover ${product.title} (${product.material}) at Ariel Leather Goods Singapore Flagship (Marina Bay Sands #01-42).`;

  const handleCopyLink = async () => {
    const url = getShareUrl();
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      } else {
        const input = document.createElement("input");
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn("Failed to copy:", e);
    }
  };

  const handleNativeShare = async () => {
    const url = getShareUrl();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url,
        });
        return;
      } catch (e) {
        // Fallback to opening our modal if user cancelled or not allowed
      }
    }
    setIsOpen(true);
  };

  const shareChannels = [
    {
      id: "whatsapp",
      name: "WhatsApp",
      description: "Singapore & Global chat",
      icon: MessageCircle,
      color: "bg-[#25D366] text-white hover:bg-[#20ba59]",
      getUrl: () => {
        const url = getShareUrl();
        const text = `${shareTitle}\n${shareText}\n${url}`;
        return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
      },
    },
    {
      id: "telegram",
      name: "Telegram",
      description: "Direct message & channels",
      icon: Send,
      color: "bg-[#229ED9] text-white hover:bg-[#1e8dbf]",
      getUrl: () => {
        const url = getShareUrl();
        return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareTitle)}`;
      },
    },
    {
      id: "facebook",
      name: "Facebook",
      description: "Post to timeline or group",
      icon: Facebook,
      color: "bg-[#1877F2] text-white hover:bg-[#166fe5]",
      getUrl: () => {
        const url = getShareUrl();
        return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
      },
    },
    {
      id: "twitter",
      name: "X (Twitter)",
      description: "Broadcast to followers",
      icon: Twitter,
      color: "bg-[#000000] text-white hover:bg-stone-800",
      getUrl: () => {
        const url = getShareUrl();
        const text = `${shareTitle} — Tuscan craftsmanship in Singapore:`;
        return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
      },
    },
    {
      id: "email",
      name: "Email Concierge",
      description: "Send formal gift referral",
      icon: Mail,
      color: "bg-amber-800 text-white hover:bg-amber-900",
      getUrl: () => {
        const url = getShareUrl();
        const subject = `Atelier Leather Commission: ${product.title}`;
        const body = `Dear Colleague,\n\nI wanted to share this handcrafted leather creation with you from Ariel Leather Goods Singapore (Marina Bay Sands #01-42):\n\n${product.title}\n${product.material}\nPrice: S$${product.price_sgd} (Inclusive of 9% Singapore GST)\n\nView the creation here:\n${url}\n\nKind regards.`;
        return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      },
    },
  ];

  return (
    <>
      {variant === "icon" ? (
        <button
          onClick={handleNativeShare}
          className={`w-9 h-9 rounded-full bg-white/90 hover:bg-white text-ariel-espresso flex items-center justify-center shadow-md transition-all hover:scale-110 ${className}`}
          title="Share this creation"
        >
          <Share2 className="w-4 h-4 text-ariel-amber" />
        </button>
      ) : variant === "inline" ? (
        <div className={`flex items-center gap-1.5 ${className}`}>
          {shareChannels.slice(0, 3).map((ch) => {
            const Icon = ch.icon;
            return (
              <a
                key={ch.id}
                href={ch.getUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-7 h-7 rounded-lg ${ch.color} flex items-center justify-center transition-transform hover:scale-105 shadow-2xs`}
                title={`Share via ${ch.name}`}
              >
                <Icon className="w-3.5 h-3.5" />
              </a>
            );
          })}
          <button
            onClick={handleCopyLink}
            className="h-7 px-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] font-bold flex items-center gap-1 transition-colors"
            title="Copy Product Link"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
      ) : (
        <button
          onClick={handleNativeShare}
          className={`px-3.5 py-2 rounded-xl border border-ariel-tan/40 bg-white/80 hover:bg-white text-ariel-espresso text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all ${className}`}
        >
          <Share2 className="w-3.5 h-3.5 text-ariel-amber" />
          <span>Share Creation</span>
        </button>
      )}

      {/* Share Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-ariel-tan/40 shadow-2xl relative space-y-4">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-ariel-cognac block">
                Social & Private Channels
              </span>
              <h3 className="font-serif text-lg font-bold text-ariel-espresso">
                Share This Creation
              </h3>
              <p className="text-xs text-gray-500 mt-0.5 truncate">
                {product.title} &bull; S${product.price_sgd} (SGD)
              </p>
            </div>

            {/* Product Snapshot Pill */}
            <div className="p-3 bg-ariel-sand/30 rounded-2xl border border-ariel-tan/30 flex items-center gap-3">
              <img
                src={product.image_url}
                alt={product.title}
                className="w-12 h-12 object-cover rounded-xl border border-white shrink-0 shadow-xs"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-serif text-xs font-bold text-ariel-espresso truncate">
                  {product.title}
                </h4>
                <p className="text-[10px] text-gray-500 truncate">{product.material}</p>
                <span className="text-[10px] font-bold text-emerald-800">
                  S${product.price_sgd} &bull; Incl. 9% GST
                </span>
              </div>
            </div>

            {/* Channel Links List */}
            <div className="space-y-2 pt-1">
              {shareChannels.map((ch) => {
                const Icon = ch.icon;
                return (
                  <a
                    key={ch.id}
                    href={ch.getUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setTimeout(() => setIsOpen(false), 500)}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 hover:border-ariel-tan/40 hover:bg-ariel-sand/20 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl ${ch.color} flex items-center justify-center shrink-0 shadow-2xs`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-gray-800 group-hover:text-ariel-espresso block">
                          {ch.name}
                        </span>
                        <span className="text-[10.5px] text-gray-400 block">{ch.description}</span>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-ariel-amber transition-colors" />
                  </a>
                );
              })}
            </div>

            {/* Direct 1-Click Copy Link Box */}
            <div className="pt-2 border-t border-gray-100">
              <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">
                Direct Atelier Web Address
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={getShareUrl()}
                  className="flex-1 bg-stone-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono text-gray-600 select-all focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-xs ${
                    copied
                      ? "bg-emerald-600 text-white"
                      : "bg-ariel-espresso hover:bg-ariel-cognac text-ariel-sand"
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 text-ariel-amber" />}
                  <span>{copied ? "Copied!" : "Copy"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

