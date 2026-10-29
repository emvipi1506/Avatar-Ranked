import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
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
  title: "Avatar Ranked — Chấm điểm độ hiếm avatar Roblox",
  description:
    "Nhập username Roblox để quét trang phục, phụ kiện, thâm niên và độ nổi tiếng, sau đó nhận điểm số và bậc độ hiếm từ Common đến Mythic.",
  openGraph: {
    title: "Avatar Ranked — Avatar Roblox của bạn hiếm cỡ nào?",
    description: "Chấm điểm và xếp hạng độ hiếm avatar Roblox chỉ trong vài giây.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFDF5",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="min-h-dvh">
        {/* Nền ánh sáng neon cố định */}
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-neon-violet/20 blur-[120px]" />
          <div className="absolute -right-40 top-1/3 h-[480px] w-[480px] rounded-full bg-neon-pink/10 blur-[120px]" />
          <div className="absolute bottom-0 left-1/3 h-[420px] w-[420px] rounded-full bg-neon-cyan/10 blur-[120px]" />
        </div>
        {children}
      </body>
    </html>
  );
}
