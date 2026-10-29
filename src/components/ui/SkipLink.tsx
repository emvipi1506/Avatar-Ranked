export default function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only z-[100] rounded-nb-sm border-3 border-ink bg-lemon px-4 py-3 font-mono text-xs font-bold uppercase text-ink shadow-hard-2 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
    >
      Bỏ qua tới nội dung
    </a>
  );
}
