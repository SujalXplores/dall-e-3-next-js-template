import { Inter } from "next/font/google";
import "./globals.css";
import { getServerSession } from "next-auth/next";
import SessionProvider from "@/components/session-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "AI Artistry | Dall-E 3 Image Generator",
  description:
    "Create stunning visuals with our Dall-E 3 Free Image Generator. Harness the power of AI to generate unique artwork, illustrations, and designs in seconds. Perfect for designers, marketers, and content creators seeking high-quality images without the cost.",
};

export default async function RootLayout({ children }) {
  const session = await getServerSession();
  return (
    <html lang="en">
      <SessionProvider session={session}>
        <body className={inter.className}>{children}</body>
      </SessionProvider>
    </html>
  );
}