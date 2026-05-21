import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CV Tailor",
  description: "Tailor your CV to any job description",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
