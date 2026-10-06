import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "Ariel Leather Goods | Florentine Craftsmanship & Singapore Atelier",
  description: "Handcrafted Tuscan full-grain leather wallets, bags, belts, and bespoke monogramming. Complimentary Singapore white-glove courier.",
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
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
