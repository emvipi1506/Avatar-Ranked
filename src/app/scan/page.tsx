import type { Metadata } from "next";
import ScanWorkspace from "@/components/scan/ScanWorkspace";
import { isValidUsername } from "@/lib/roblox";

export const metadata: Metadata = {
  title: "Chấm avatar Roblox — Avatar Ranked",
  description:
    "Nhập username Roblox để nhận điểm /10, con dấu verdict, bảng tiêu chí /100 và gợi ý nâng cấp outfit. Không cần đăng nhập.",
  alternates: { canonical: "/scan" },
  openGraph: {
    title: "Chấm avatar Roblox — Avatar Ranked",
    description: "Roast, rate và xếp hạng avatar Roblox chỉ trong vài giây.",
    type: "website",
    locale: "vi_VN",
  },
};

interface ScanPageProps {
  searchParams: Promise<{ u?: string | string[] }>;
}

export default async function ScanPage({ searchParams }: ScanPageProps) {
  const params = await searchParams;
  const raw = Array.isArray(params.u) ? params.u[0] : params.u;
  const candidate = typeof raw === "string" ? raw.trim() : "";
  const initialUsername = isValidUsername(candidate) ? candidate : null;

  return (
    <>
      <noscript>
        <div className="border-b-3 border-ink bg-warning-bg px-4 py-3 text-center text-sm font-semibold text-warning">
          Bạn cần bật JavaScript để quét avatar.{" "}
          <a href="/" className="underline underline-offset-4">
            Về trang chủ
          </a>
          .
        </div>
      </noscript>
      <ScanWorkspace initialUsername={initialUsername} />
    </>
  );
}
