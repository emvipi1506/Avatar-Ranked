import { redirect } from "next/navigation";
import { isValidUsername } from "@/lib/roblox";

interface ScanPageProps {
  searchParams: Promise<{ u?: string | string[] }>;
}

export default async function ScanPage({ searchParams }: ScanPageProps) {
  const params = await searchParams;
  const raw = Array.isArray(params.u) ? params.u[0] : params.u;
  const candidate = typeof raw === "string" ? raw.trim() : "";
  const initialUsername = isValidUsername(candidate) ? candidate : null;

  if (initialUsername) {
    redirect(`/?u=${encodeURIComponent(initialUsername)}`);
  }
  redirect("/");
}
