import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ariel Leather Goods | Artisanal Craftsmanship & Bedrock Semantic Search",
  description: "Bespoke Italian leather wallets, bags, belts, and accessories powered by Amazon Bedrock Nova intent reasoning and PostgreSQL pgvector semantic retrieval.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans bg-ariel-cream text-ariel-espresso min-h-screen flex flex-col selection:bg-ariel-amber selection:text-white">
        {children}
      </body>
    </html>
  );
}
