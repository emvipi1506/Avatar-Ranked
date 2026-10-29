import type { Metadata } from "next";
import SiteFooter from "@/components/ui/SiteFooter";
import SiteHeader from "@/components/ui/SiteHeader";
import SkipLink from "@/components/ui/SkipLink";

export const metadata: Metadata = {
  title: "Design Preview — Avatar Ranked",
  description: "Preview nội bộ cho design system Neo-Brutalism.",
  robots: { index: false, follow: false },
};

export default function PreviewLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="nb-root flex min-h-dvh flex-col">
      <SkipLink />
      <SiteHeader variant="preview" />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
