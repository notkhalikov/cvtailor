import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CV Tailor — резюме под каждую вакансию",
  description:
    "ИИ-сервис, который адаптирует ваше резюме под конкретную вакансию: match score, gap-анализ и экспорт в PDF.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="ru" className={`${outfit.variable} ${jetbrainsMono.variable}`}>
        <body className="bg-zinc-950 font-sans text-zinc-50 antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
