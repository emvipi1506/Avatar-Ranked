import type { Metadata } from "next";
import LiveBoard from "@/components/live/LiveBoard";

export const metadata: Metadata = {
  title: "Bảng live — Avatar Ranked",
  description: "Bảng xếp hạng avatar tự cập nhật, dành cho OBS khi livestream.",
  robots: { index: false, follow: false },
};

type LiveAlign = "left" | "center" | "right";

interface LivePageProps {
  searchParams: Promise<{ align?: string | string[]; bg?: string | string[] }>;
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LivePage({ searchParams }: LivePageProps) {
  const params = await searchParams;
  const rawAlign = first(params.align);
  const align: LiveAlign =
    rawAlign === "center" || rawAlign === "right" ? rawAlign : "left";
  const solid = first(params.bg) === "solid";

  return (
    <>
      {!solid && (
        <style>{`html, body { background-color: transparent !important; }`}</style>
      )}
      <LiveBoard align={align} solid={solid} />
    </>
  );
}
