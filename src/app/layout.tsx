import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { Footer } from "@/components/ui/footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TripTogether - India's Premier Transportation Platform",
  description: "Experience seamless travel with premium cab rentals, bus hiring, and bike rentals across India. Safe, reliable, and comfortable transportation solutions.",
  keywords: "cab rental, bus hiring, bike rental, transportation, travel, India, TripTogether, Mumbai, Delhi, Bangalore, Chennai",
  authors: [{ name: "TripTogether Team" }],
  creator: "TripTogether",
  publisher: "TripTogether",
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#3b82f6",
  openGraph: {
    title: "TripTogether - India's Premier Transportation Platform",
    description: "Experience seamless travel with premium cab rentals, bus hiring, and bike rentals across India.",
    url: "https://triptogether.com",
    siteName: "TripTogether",
    type: "website",
    locale: "en_IN",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "TripTogether - India's Premier Transportation Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TripTogether - India's Premier Transportation Platform",
    description: "Experience seamless travel with premium cab rentals, bus hiring, and bike rentals across India.",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: "https://triptogether.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased bg-white text-gray-900 min-h-screen flex flex-col">
        <AuthProvider>
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
