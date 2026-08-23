import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import { AuthProvider } from "@/lib/firebase/provider";
import CapacitorBackButton from "@/components/app/capacitor-back-button";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-serif-display",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LEXCONNECT — AI-Powered Legal Ecosystem",
  description: "One intelligent legal ecosystem built for the next generation of lawyers. Learn, practice, work, and collaborate.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${playfair.variable} ${jakarta.variable} scroll-smooth`}
    >
      <body suppressHydrationWarning className="bg-[#F8F4EC] text-[#21170F] font-sans antialiased selection:bg-[#D9B16A]/30 selection:text-[#21170F] min-h-screen flex flex-col">
        <AuthProvider>
          <CapacitorBackButton />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
