import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

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
      <html lang="ru">
        <body className="antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}
