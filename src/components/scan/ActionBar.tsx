"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  RotateCcw,
  Search,
  Share2,
} from "lucide-react";
import Button, { buttonClasses } from "@/components/ui/Button";
import { soundManager } from "@/lib/sound";
import { getShareText } from "@/lib/ui/verdict";
import { formatScore10 } from "@/lib/format";
import type { RobloxUser, ScoreReport } from "@/types";

export interface ActionBarProps {
  user: RobloxUser;
  report: ScoreReport;
  onScanAgain: () => void;
  onNewSearch: () => void;
}

function canonicalUrl(username: string): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/scan?u=${encodeURIComponent(username)}`;
}

async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Rơi xuống fallback bên dưới.
    }
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

export default function ActionBar({ user, report, onScanAgain, onNewSearch }: ActionBarProps) {
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [manualText, setManualText] = useState<string | null>(null);
  const statusTimer = useRef<number | null>(null);
  const manualRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    return () => {
      if (statusTimer.current !== null) window.clearTimeout(statusTimer.current);
    };
  }, []);

  const announce = useCallback((message: string, isCopy = false) => {
    setStatus(message);
    setCopied(isCopy);
    if (statusTimer.current !== null) window.clearTimeout(statusTimer.current);
    statusTimer.current = window.setTimeout(() => {
      setStatus(null);
      setCopied(false);
    }, 4000);
  }, []);

  const buildText = useCallback(
    () => getShareText({ user, report, url: canonicalUrl(user.name) }),
    [user, report],
  );

  const showManualText = useCallback((text: string) => {
    setManualText(text);
    window.setTimeout(() => {
      manualRef.current?.focus({ preventScroll: true });
      manualRef.current?.select();
    }, 80);
  }, []);

  const handleCopy = useCallback(async () => {
    soundManager.playClick();
    const text = buildText();
    const ok = await copyToClipboard(text);

    if (ok) {
      setManualText(null);
      announce("Đã copy báo cáo. Dán vào Discord hoặc note của bạn.", true);
      return;
    }

    showManualText(text);
    announce("Không copy tự động được. Nội dung báo cáo đã mở bên dưới để bạn copy thủ công.");
  }, [announce, buildText, showManualText]);

  const handleShare = useCallback(async () => {
    soundManager.playClick();
    const url = canonicalUrl(user.name);
    const text = buildText();

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: `Avatar Ranked: ${user.displayName} · ${formatScore10(report.total)}/10`,
          text,
          url,
        });
        announce("Đã mở hộp thoại chia sẻ.");
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    const ok = await copyToClipboard(text);
    if (ok) {
      setManualText(null);
      announce("Thiết bị không hỗ trợ share trực tiếp — đã copy báo cáo để bạn dán đi.", true);
      return;
    }

    showManualText(text);
    announce("Không chia sẻ được. Nội dung báo cáo đã mở bên dưới để bạn copy thủ công.");
  }, [announce, buildText, report.total, showManualText, user.displayName, user.name]);

  return (
    <div className="border-t-3 border-ink pt-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={() => {
            soundManager.playClick();
            onScanAgain();
          }}
          iconLeft={<RotateCcw className="h-4 w-4" aria-hidden />}
          className="col-span-2 sm:col-span-1"
        >
          Roast lại
        </Button>

        <Button
          type="button"
          id="btn-copy-report"
          variant="secondary"
          size="md"
          onClick={handleCopy}
          iconLeft={
            copied ? <Check className="h-4 w-4 text-success" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />
          }
        >
          {copied ? "Đã copy" : "Copy"}
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={handleShare}
          iconLeft={<Share2 className="h-4 w-4" aria-hidden />}
        >
          Chia sẻ
        </Button>

        <a
          href={`https://www.roblox.com/users/${user.id}/profile`}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClasses({ variant: "ghost", size: "md", className: "col-span-2 w-full sm:col-span-1" })}
        >
          <ExternalLink className="h-4 w-4" aria-hidden />
          Mở Roblox
        </a>
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t-2 border-line-soft pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-[1.5] text-muted">
          Ảnh kết quả sẽ có ở giai đoạn sau. Hiện tại bạn có thể copy hoặc chia sẻ báo cáo dạng text.
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onNewSearch}
          iconLeft={<Search className="h-4 w-4" aria-hidden />}
          className="shrink-0"
        >
          Quét username khác
        </Button>
      </div>

      <p className="mt-2 min-h-5 text-xs font-semibold leading-[1.5] text-ink-2" role="status" aria-live="polite">
        {status}
      </p>

      {manualText && (
        <div className="mt-2 rounded-nb-md border-3 border-ink bg-surface-2 p-3 shadow-hard-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label
              htmlFor="share-text"
              className="font-mono text-xs font-bold uppercase tracking-[0.05em] text-ink"
            >
              Nội dung báo cáo
            </label>
            <button
              type="button"
              onClick={() => {
                setManualText(null);
                document.getElementById("btn-copy-report")?.focus();
              }}
              className="font-mono text-[10px] font-bold uppercase tracking-[0.04em] text-ink-2 underline underline-offset-4 hover:text-coral-ink"
            >
              Đóng
            </button>
          </div>
          <p className="mt-1 text-xs leading-[1.5] text-ink-2">
            Nội dung đã được chọn sẵn. Nhấn Ctrl/Cmd + C để copy, hoặc chọn tay phần bạn cần.
          </p>
          <textarea
            id="share-text"
            ref={manualRef}
            readOnly
            value={manualText}
            rows={8}
            spellCheck={false}
            onFocus={(event) => event.currentTarget.select()}
            className="mt-2 w-full resize-y rounded-nb-sm border-2 border-ink bg-surface p-2.5 font-mono text-xs leading-[1.6] text-ink focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-ink"
          />
        </div>
      )}
    </div>
  );
}
