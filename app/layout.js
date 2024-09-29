import { Inter } from "next/font/google";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "AI Artistry | Dall-E 3 Image Generator",
  description:
    "Create stunning visuals with our Dall-E 3 Free Image Generator. Harness the power of AI to generate unique artwork, illustrations, and designs in seconds. Perfect for designers, marketers, and content creators seeking high-quality images without the cost.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
