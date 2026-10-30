import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import { THEME_COLORS, THEME_INIT_SCRIPT } from "@/lib/theme";
import "@/styles/tokens.css";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin", "vietnamese"],
  weight: ["700", "800"],
  variable: "--font-display",
  display: "swap",
});

const body = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-body",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://avatar-ranked.vercel.app"),
  title: "Avatar Ranked — Avatar Roblox của bạn có drip không?",
  description:
    "Nhập username Roblox để nhận điểm /10, con dấu verdict và một tràng roast (hoặc khen). Chấm theo 4 tiêu chí, gu cá nhân là tùy chọn.",
  openGraph: {
    title: "Avatar Ranked — Avatar Roblox của bạn có drip không?",
    description: "Roast, rate và xếp hạng avatar Roblox chỉ trong vài giây.",
    type: "website",
    locale: "vi_VN",
  },
  twitter: {
    card: "summary",
    title: "Avatar Ranked — Avatar Roblox của bạn có drip không?",
    description: "Roast, rate và xếp hạng avatar Roblox chỉ trong vài giây.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: THEME_COLORS.light },
    { media: "(prefers-color-scheme: dark)", color: THEME_COLORS.dark },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="vi"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
