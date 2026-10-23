export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#080A12]/90">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-center text-xs text-slate-500 sm:flex-row sm:text-left sm:px-6">
        <div>
          <p className="font-sans font-bold text-slate-400">
            AVATAR RANKED &copy; {new Date().getFullYear()} — Your Avatar. Your Rarity. Your Legend.
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            Hệ thống chấm điểm AI mô phỏng và xếp hạng Rarity mang tính chất giải trí cộng đồng.
          </p>
        </div>

        <div className="text-right text-[11px] text-slate-500">
          <p>This project is not affiliated, endorsed, or sponsored by Roblox Corporation.</p>
          <p className="text-[10px] text-slate-600">Roblox is a registered trademark of Roblox Corporation.</p>
        </div>
      </div>
    </footer>
  );
}
