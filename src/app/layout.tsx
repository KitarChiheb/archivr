import type { Metadata } from "next";
import "./globals.css";

// 📚 LEARN: Metadata in Next.js App Router is defined as an exported object.
// This sets the <title>, <meta description>, and Open Graph tags for SEO and social sharing.
export const metadata: Metadata = {
  title: "Archivrr — Your Instagram saves, finally organized.",
  description:
    "Archivrr turns your chaotic saved posts pile into a searchable, tagged, AI-powered personal archive.",
  openGraph: {
    title: "Archivrr",
    description: "Your Instagram saves, finally organized.",
    type: "website",
  },
};

// 📚 LEARN: The root layout wraps every page. It's the equivalent of _app.tsx in the Pages Router.
// We set the font-family via CSS (globals.css) rather than next/font here for simplicity with Google Fonts @import.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-bg text-text-primary transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}
