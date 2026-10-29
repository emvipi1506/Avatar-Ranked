# Kế hoạch Rebuild Frontend — Avatar Ranked (Neo-Brutalism)

> **Trạng thái:** Đề xuất, **chưa thay đổi code**.
> **Phạm vi:** Toàn bộ UI, component, CSS, layout, copy hiển thị.
> **Không đổi:** `src/lib/scoring.ts`, `src/lib/fandom*`, `src/lib/catalog.ts`, `src/lib/palette.ts`, `src/lib/roblox.ts`, `src/app/api/**`, `src/types/index.ts`, `tests/scoring.test.ts` (trừ khi có quyết định riêng).
> **Mục tiêu:** Landing page `/` → trang trong `/scan` → nhập username → xem kết quả, theo phong cách Neo-Brutalism trong `DESIGN.md`.

---

## 0. TL;DR

`DESIGN.md` là một **creative brief tốt**, nhưng **chưa đủ để implement chính xác**. Nó mô tả đúng “cảm giác” Neo-Brutalism, nhưng còn quá nhiều chỗ dùng “hoặc”, thiếu token cụ thể, thiếu state, thiếu responsive, thiếu cấu trúc trang và thiếu content model.

**Kết luận đánh giá: `NEEDS REVISION`.**

**Quyết định đã chốt (30/10/2026):**

1. Điểm hiển thị: **`8.5/10`**; breakdown vẫn `/100`.
2. **Giữ** 6 bậc rarity + thanh Gu cá nhân 25%.
3. Gu cá nhân mặc định là **“Chưa chọn”** (`null`). Khi chưa chọn, điểm tổng = **100% điểm hệ thống**, không bị trừ 25%.
4. Export ảnh chia sẻ: **Phase 2**; MVP dùng copy/share text + URL.

Kế hoạch rebuild đề xuất:

1. **Checkpoint an toàn** trước khi sửa: hiện working tree đang có nhiều thay đổi chưa commit.
2. **Tách route:** `/` = landing tĩnh, `/scan` = workspace nhập username và xử lý kết quả.
3. **Đóng băng business logic:** chỉ thay lớp UI; giữ nguyên scoring, API, types và 36 test hiện có.
4. **Xây design system mới** (tokens → primitives → landing → scan workspace → QA).
5. **Làm trên branch riêng + route `/preview`** để so sánh, chỉ swap route khi đã đạt acceptance criteria.
6. **Không dùng lại** các class neon/glass hiện tại (`glass-card`, `btn-gaming-*`, `cyber-grid`, `text-neon-title`, `animate-hologram`...).

---

## 1. Đánh giá `DESIGN.md`

### 1.1. Điểm số nhanh

| Tiêu chí | Điểm | Nhận xét |
|---|---:|---|
| Design System & Tokens | **3/5** | Có palette, border, shadow, radius, font direction. Nhưng giá trị còn “A hoặc B”, thiếu neutral scale, focus, spacing, type scale, motion. |
| Component Completeness | **2/5** | Chỉ nêu tên 5 khối. Không có anatomy, kích thước, state hover/active/focus/disabled/loading/error, responsive. |
| Ambiguity / Gaps | **1.5/5** | Thiếu cấu trúc landing, error/loading, asset handling, content model, score→stamp mapping, accessibility, export format. |
| **Tổng thể** | **~2/5** | **Moodboard tốt, spec chưa đủ.** |

### 1.2. Những điểm làm tốt

- **Định hướng rõ ràng:** Neo-Brutalism, truyện tranh/meme, Gen Z, không sci-fi neon, không dashboard công sở.
- **Palette có cá tính:** kem `#FFFDF5`, vàng chanh `#FFE600`, cam san hô `#FF6B4A`, mint `#70E3B6`, tím `#B590FF`, cyan `#5DE2E7`.
- **Hard shadow đúng tinh thần:** `3px 3px 0`, `4px 4px 0`, `6px 6px 0`, không blur.
- **Active state có mô tả:** `translate(2px, 2px)` + giảm shadow.
- **Radius đúng hướng:** 8–16px, không bo full.
- **Typography có phân vai:** display đậm cho tiêu đề/điểm số; body/mono cho dữ liệu.
- **5 khối UI cốt lõi** đã được xác định đúng: Input, Avatar Showcase, Verdict + Stamp, Feedback Bubbles, Action Bar.

### 1.3. Lỗ hổng khiến developer phải đoán

#### A. Token chưa phải token

- Background: `#FFFDF5` **hoặc** `#F5F3E9`.
- Ink: `#121212` **hoặc** `#000000`.
- Card surface: trắng **hoặc** pastel/pop.
- Shadow card: `4px` **hoặc** `6px`.
- Font display: Space Grotesk **hoặc** Lexend Mega **hoặc** Syne.
- Font body: Plus Jakarta Sans **hoặc** JetBrains Mono.

> Với 2 lựa chọn cho mỗi token, 2 developer sẽ ra 2 giao diện khác nhau. Cần **một giá trị duy nhất** cho mỗi token, kèm mục đích sử dụng.

Thiếu hoàn toàn:

- Neutral scale cho text phụ, placeholder, disabled, divider mềm.
- Màu success / warning / danger / info và background tint tương ứng.
- Quy tắc contrast: **trắng trên cam `#FF6B4A` chỉ đạt 2.82:1, fail WCAG AA**. Phải dùng chữ đen trên cam (6.70:1).
- Type scale: size, line-height, weight, letter-spacing, uppercase cho từng role.
- Spacing scale, container width, breakpoints.
- Focus-visible ring.
- Motion duration/easing.
- Quy tắc dùng accent: tối đa bao nhiêu màu trên một màn? Vàng dùng ở đâu? Cam có được dùng cho tag không?
- Quy tắc elevation: phần tử nào được shadow 3/4/6/8px? Có được shadow mọi card không?

#### B. Component chỉ có tên, chưa có hợp đồng

Với từng component, spec chưa trả lời:

- Kích thước, padding, border, radius, shadow nào?
- Cấu trúc DOM/anatomy ra sao?
- Hover / active / focus / disabled / loading / error / empty state thế nào?
- Mobile xếp lại ra sao?
- Nội dung nào là bắt buộc, nội dung nào optional?
- Accessibility: label, aria, keyboard, contrast?

Cụ thể:

| Component | Câu hỏi chưa được trả lời |
|---|---|
| **Input Bar** | Input + button nằm cùng một khung hay tách? Chiều cao? Placeholder? Validate lúc nào? Lỗi hiển thị ở đâu? Loading state? Có chip ví dụ không? Có auto-submit khi bấm chip không? |
| **Avatar Showcase** | Ảnh snapshot hay model 3D? Tỷ lệ khung? Nền checkerboard hay sóng retro? Kích thước ô? Avatar trong suốt hay có nền? Fallback khi ảnh lỗi? Tag tên đặt ở đâu? Có xoay card không? |
| **Verdict + Stamp** | Điểm thang 10 hay 100? Format `8.5/10` hay `85/100`? Stamp text lấy từ đâu? Stamp xoay bao nhiêu độ? Stamp đặt đâu? Stamp màu gì? Score nào map ra stamp nào? Có animation không? |
| **Feedback Bubbles** | Bao nhiêu bubble? Ai nói? Bubble xen kẽ trái/phải không? Đuôi bubble chỉ hướng nào? Màu nào cho praise/roast/tip? Nội dung lấy từ field nào của `ScoreReport`? Mobile xử lý sao? |
| **Action Bar** | Những nút nào? Thứ tự? Nút nào primary? “Xuất ảnh” là export PNG thật hay chỉ share link? Copy success hiển thị bao lâu? Sticky mobile hay nằm cuối trang? |

#### C. Thiếu cấu trúc trang

`DESIGN.md` chỉ có 5 khối, chưa có:

- Landing page gồm những section nào? Hero? Social proof? How it works? Rarity guide? FAQ? Final CTA?
- Trang trong có những state nào? Entry → Found → Scanning → Reveal → Result?
- Điều gì xảy ra khi refresh? Có deep link `/scan?u=username` không?
- Có giữ 6 bậc rarity hiện tại (`COMMON` → `MYTHICAL`) không?
- Có giữ thanh “Gu cá nhân 25%” không? Đây là feature lớn của app hiện tại nhưng `DESIGN.md` không nhắc.
- Có giữ sound toggle, confetti, rarity reveal không?

#### D. Thiếu state

Không có mô tả cho:

- Username sai format.
- Username không tồn tại (404).
- Roblox rate limit (429).
- Roblox API lỗi (5xx/network).
- Avatar thumbnail không tải được.
- Catalog giá không tải được (score vẫn chạy nhưng data quality thấp).
- Scan quá lâu.
- Copy/share thất bại.
- Ảnh avatar lỗi.
- Report thiếu dữ liệu (mảng strengths/weaknesses rỗng).
- Người dùng chưa chọn “gu cá nhân”.

#### E. Thiếu responsive & accessibility

- Không có breakpoint.
- Không nói H1, score, stamp scale thế nào trên mobile.
- Không nói Input + button xếp dọc hay ngang trên mobile.
- Không nói action bar 2x2 hay cuộn ngang.
- Không có focus ring, keyboard order, aria-live cho progress, alt text, reduced-motion.
- Stamp xoay nghiêng có thể gây khó đọc; cần text thật trong DOM, không chỉ pseudo-element.

#### F. Thiếu asset handling & content model

- Ảnh avatar Roblox lấy từ `*.rbxcdn.com`; cần `next/image` remote pattern (đã có trong `next.config.ts`).
- Ảnh trong suốt 720×720; cần `object-contain`, không crop.
- Fallback avatar khi ảnh lỗi.
- Landing cần sample avatar: dùng ảnh Roblox thật hay illustration nội bộ? (Khuyến nghị: illustration/SVG nội bộ để landing tĩnh, không gọi API.)
- Chưa có copy deck: headline, CTA, error, empty, stamp vocabulary.
- Chưa có tone guardrail cho “roast”: tránh body shaming, slur, tấn công cá nhân; chỉ trêu outfit.
- Chưa nói ngôn ngữ: Việt hoàn toàn, Anh hoàn toàn, hay Việt + English slang?

#### G. Điểm mâu thuẫn với code hiện tại

- `DESIGN.md` ví dụ `8.5/10`, app hiện tại dùng `total` 0–100 và 6 tier.
- `DESIGN.md` không nhắc “Gu cá nhân 25%”, nhưng đây là feature đang có trong scoring và UI.
- App hiện tại gọi là “AI Scanner / AI 75%”, nhưng `ScoreReport.analysisMethod` là `"rule-based"`. Copy mới **không nên** tiếp tục gọi là AI nếu không có model AI thật; nên nói “hệ thống chấm điểm”, “270 aesthetics”, “dữ liệu catalog” để trung thực.
- App hiện tại dùng gradient/neon/glow khắp nơi; `DESIGN.md` cấm blur shadow nhưng không cấm gradient. Tuy nhiên để đúng Neo-Brutalism, nên **bỏ gradient trang trí**, dùng flat fill + hard shadow.

### 1.4. Verdict

**`NEEDS REVISION` — chưa đủ để build chính xác.**

Nếu đưa `DESIGN.md` hiện tại cho một developer/agent, họ sẽ phải tự quyết định khoảng **60–70%** chi tiết thị giác và state. Kết quả sẽ “na ná Neo-Brutalism” nhưng không consistent, đặc biệt ở:
- màu accent nào dùng cho component nào,
- score/stamp mapping,
- responsive,
- error/loading,
- nội dung bubble,
- export ảnh.

### 1.5. 10 việc cần siết trong spec (đã được cụ thể hóa ở Mục 4)

1. Chốt **một** giá trị cho mỗi token; bỏ mọi “hoặc”.
2. Thêm neutral/status colors + quy tắc contrast (đặc biệt: không dùng chữ trắng trên cam).
3. Chốt **một** font pairing + type scale đầy đủ, có kiểm tra tiếng Việt.
4. Thêm spacing, container, breakpoint, radius scale, elevation scale.
5. Viết anatomy + state matrix cho 5 component cốt lõi.
6. Thêm page IA: landing sections + scan states.
7. Định nghĩa score → tier → stamp → bubble mapping bằng hàm thuần, có test.
8. Thêm error/loading/empty/rate-limit states.
9. Thêm responsive, focus, keyboard, reduced-motion, alt text.
10. Thêm acceptance criteria + visual QA checklist.

---

## 2. Phạm vi & nguyên tắc rebuild

### 2.1. In scope

- `src/app/layout.tsx`, `src/app/globals.css`, `tailwind.config.ts`.
- Landing page mới tại `/`.
- Trang trong `/scan`.
- Toàn bộ component UI mới: layout, primitives, landing sections, scan workspace, result panels.
- Design tokens, pattern CSS, motion, responsive, accessibility.
- Copy hiển thị tiếng Việt + English stamp.
- Metadata, favicon, OG image.
- QA, cleanup component/CSS cũ.
- **Một thay đổi scoring đã được duyệt:** thêm trạng thái Gu cá nhân = `null` (“Chưa chọn”). Đây là ngoại lệ duy nhất so với nguyên tắc UI-only; công thức 75/25 khi đã chọn vẫn giữ nguyên.

### 2.2. Out of scope (giai đoạn này)

- Không đổi ngưỡng rarity, trọng số 75/25 khi đã chọn gu.
- Không đổi API routes `/api/roblox/*` và cách gọi Roblox.
- Không thêm database, auth, analytics, payment.
- Không đổi các test scoring hiện có; chỉ **thêm** test cho trạng thái `null`.
- Không xuất ảnh PNG trong MVP (xem Phase 5 / quyết định).

### 2.3. Nguyên tắc

1. **UI-only:** mọi thay đổi business logic phải là một quyết định riêng, có test.
2. **Single source of truth:** màu/typo/shadow/radius nằm trong tokens, không hard-code hex rải rác.
3. **Không dùng lại class cũ:** không import `glass-card`, `btn-gaming-*`, `cyber-grid`, `text-neon-title`, `animate-hologram`, `animate-laser`.
4. **Static landing:** landing không gọi Roblox API, không cần client JS nặng.
5. **Progressive enhancement:** landing đọc được khi JS lỗi; `/scan` có `<noscript>`.
6. **Honest copy:** không gọi “AI” nếu scoring là rule-based; ghi rõ “mang tính giải trí”.
7. **Mobile-first:** test từ 320px trước khi lên desktop.

---

## 3. Hiện trạng codebase (baseline)

- **Next.js** 15.5.28 (App Router), **React** 19, **Tailwind CSS** 3.4.17, TypeScript strict.
- **Dependencies:** `framer-motion`, `lucide-react`, `canvas-confetti`.
- **`npm run build`:** pass (First Load JS `/` = 225 kB).
- **`npm test`:** 36/36 pass.
- **Landing hiện tại:** `/` chứa luôn input + toàn bộ workspace; chưa tách landing.
- **Style hiện tại:** dark neon glass, gradient, blur, glow — ngược hoàn toàn với Neo-Brutalism.
- **Component lớn nhất:** `ResultCard.tsx` ~811 dòng, gánh quá nhiều trách nhiệm.
- **Component không dùng:** `AvatarPreview.tsx`, `ScanProgress.tsx`.
- **Git working tree:** đang có thay đổi chưa commit/staged (scoring, types, tests, ResultCard, AvatarScanner, ScoreBreakdown, fandom files, scripts...). **Đây là rủi ro cao nhất trước khi rebuild.**

### 3.1. Checkpoint bắt buộc trước khi sửa

```powershell
# Tạo branch an toàn, commit toàn bộ trạng thái hiện tại
git switch -c rebuild/neo-brutalist
git add -A
git commit -m "chore: checkpoint before neo-brutalist rebuild"

# Tạo tag để rollback
git tag pre-neo-brutalist
```

Nếu chưa muốn commit:

```powershell
git stash push -u -m "pre-neo-brutalist"
# hoặc copy nguyên thư mục avatar-ranked ra ngoài
```

> Không bắt đầu Phase 1 khi chưa có checkpoint. Mọi thay đổi rebuild phải nằm trên branch riêng.

---

## 4. Design System v1 — implementation-ready

> Đây là bản siết lại `DESIGN.md`. Tất cả giá trị dưới đây là **quyết định**, không còn “hoặc”.

### 4.1. Color tokens

```css
:root {
  /* Base */
  --c-bg: #FFFDF5;
  --c-surface: #FFFFFF;
  --c-surface-2: #F5F3E9;
  --c-ink: #111111;
  --c-ink-2: #3D3B33;
  --c-muted: #6B675A;
  --c-line: #111111;
  --c-line-soft: #D8D3C4;

  /* Accents */
  --c-lemon: #FFE600;
  --c-coral: #FF6B4A;
  --c-coral-ink: #B23A1F; /* chỉ dùng cho text/link trên nền sáng */
  --c-mint: #70E3B6;
  --c-violet: #B590FF;
  --c-cyan: #5DE2E7;

  /* Status */
  --c-danger: #B42318;
  --c-danger-bg: #FFE1DE;
  --c-warning: #8A4B00;
  --c-warning-bg: #FFF1C2;
  --c-success: #05603A;
  --c-success-bg: #D9FBE9;
}
```

**Quy tắc sử dụng màu:**

| Vùng | Màu nền | Màu chữ | Ghi chú |
|---|---|---|---|
| Page | `--c-bg` | `--c-ink` | Nền kem chủ đạo |
| Card thường | `--c-surface` | `--c-ink` | Viền ink 3px |
| Card nhấn | `--c-lemon` | `--c-ink` | Avatar showcase, highlight |
| CTA chính | `--c-coral` | `--c-ink` | **Không dùng chữ trắng** (2.82:1 fail) |
| Verdict | `--c-mint` | `--c-ink` | Khối điểm |
| Tag / bubble phụ | `--c-violet`, `--c-cyan` | `--c-ink` | Dùng tint nhạt cho nền bubble |
| Footer | `--c-ink` | `--c-bg` | Đảo màu |
| Lỗi | `--c-danger-bg` | `--c-danger` | Viền ink |
| Cảnh báo | `--c-warning-bg` | `--c-warning` | Data quality |
| Thành công | `--c-success-bg` | `--c-success` | Copy success |

**Quy tắc accent budget:**

- Tối đa **2 accent** trong một viewport (không tính màu tier badge nhỏ).
- **Vàng chanh** chỉ dùng cho: avatar frame, highlight heading, sticker, tier LEGENDARY.
- **Cam san hô** chỉ dùng cho: CTA chính, stamp roast, cảnh báo nhẹ.
- **Mint** chỉ dùng cho: verdict card, praise bubble, success.
- **Tím/Cyan** chỉ dùng cho: tag, chip, bubble phụ, link phụ.
- Không dùng accent làm nền cho đoạn text dài.

**Contrast đã kiểm tra:**

| Cặp | Tỷ lệ | Kết luận |
|---|---:|---|
| `#111` trên `#FFFDF5` | 18.54 | Pass AAA |
| `#111` trên `#FFE600` | 14.90 | Pass AAA |
| `#111` trên `#70E3B6` | 12.01 | Pass AAA |
| `#111` trên `#5DE2E7` | 12.14 | Pass AAA |
| `#111` trên `#B590FF` | 7.55 | Pass AAA |
| `#111` trên `#FF6B4A` | 6.70 | Pass AA |
| `#FFFFFF` trên `#FF6B4A` | 2.82 | **Fail — cấm** |

### 4.2. Typography

**Font pairing chốt:**

- **Display:** `Bricolage Grotesque` 800 — hình học, cá tính, hỗ trợ tiếng Việt.
- **Body:** `Be Vietnam Pro` 400/500/600/700 — tiếng Việt tốt, dễ đọc.
- **Data/Label:** `JetBrains Mono` 500/700 — username, score, nhãn nhỏ.

```ts
// layout.tsx
const display = Bricolage_Grotesque({
  subsets: ["latin", "vietnamese"],
  weight: ["700", "800"],
  variable: "--font-display",
  display: "swap",
});

const body = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-mono",
  display: "swap",
});
```

> `JetBrains Mono` không cần subset Vietnamese vì chỉ dùng cho username/score/nhãn tiếng Anh. Nếu có nhãn tiếng Việt trong mono, dùng `Be Vietnam Pro` thay thế.

**Type scale:**

| Token | Size / Line-height | Weight | Dùng cho |
|---|---|---|---|
| `--fs-2xs` | 11 / 14 | Mono 700 | Nhãn cực nhỏ, stamp meta |
| `--fs-xs` | 12 / 16 | Mono 700 | Eyebrow, tag, helper |
| `--fs-sm` | 14 / 20 | Body 500 | Caption, metadata |
| `--fs-md` | 16 / 26 | Body 400/500 | Body mặc định |
| `--fs-lg` | 18 / 28 | Body 500 | Body lớn, lead |
| `--fs-xl` | 24 / 30 | Display 800 | H3, card title |
| `--fs-2xl` | 32 / 36 | Display 800 | H2 mobile |
| `--fs-3xl` | `clamp(40px, 5vw, 56px)` / 1 | Display 800 | H2 desktop |
| `--fs-4xl` | `clamp(56px, 7vw, 80px)` / 0.95 | Display 800 | H1 |
| `--fs-5xl` | `clamp(72px, 10vw, 120px)` / 0.9 | Display 800 | Score chính |

**Quy tắc:**

- Display: `text-transform: uppercase`, `letter-spacing: -0.02em`, `line-height` 0.9–1.
- Body: không uppercase, `letter-spacing: 0`, `line-height` 1.55–1.65.
- Mono label: uppercase, `letter-spacing: 0.08em`, size 11–12.
- Score: `font-variant-numeric: tabular-nums`.
- Không dùng quá 3 cấp heading trên một section.
- Không dùng font weight 300/100; Neo-Brutalism cần đậm.

### 4.3. Spacing, container, breakpoint

```css
:root {
  --sp-1: 4px;
  --sp-2: 8px;
  --sp-3: 12px;
  --sp-4: 16px;
  --sp-5: 24px;
  --sp-6: 32px;
  --sp-7: 40px;
  --sp-8: 48px;
  --sp-9: 64px;
  --sp-10: 80px;
  --sp-11: 96px;
  --sp-12: 128px;

  --container: 1200px;
  --container-narrow: 760px;
  --gutter: clamp(16px, 4vw, 32px);
  --section-y: clamp(64px, 8vw, 120px);
}
```

**Breakpoints (Tailwind mặc định, mobile-first):**

| Tên | Min-width | Hành vi chính |
|---|---:|---|
| base | 0 | 1 cột, input stack, stamp tĩnh |
| `sm` | 640 | Action bar 4 cột, bubble xen kẽ |
| `md` | 768 | Landing 2 cột bắt đầu |
| `lg` | 1024 | Result 12-col, stamp absolute |
| `xl` | 1280 | Container 1200px, hero thoáng |

**Quy tắc layout:**

- Container: `max-width: var(--container); margin-inline: auto; padding-inline: var(--gutter);`
- Section: `padding-block: var(--section-y);`
- Grid gap: 16px mobile, 24px desktop.
- Không để nội dung rộng quá 72ch.
- Test bắt buộc tại: 320, 360, 390, 768, 1024, 1440.

### 4.4. Border, shadow, radius

```css
:root {
  --bw-1: 2px;
  --bw-2: 3px;
  --bw-3: 4px;

  --shadow-1: 3px 3px 0 var(--c-ink);
  --shadow-2: 4px 4px 0 var(--c-ink);
  --shadow-3: 6px 6px 0 var(--c-ink);
  --shadow-4: 8px 8px 0 var(--c-ink);

  --r-sm: 8px;
  --r-md: 12px;
  --r-lg: 16px;
}
```

**Elevation scale:**

| Level | Shadow | Dùng cho |
|---|---|---|
| 0 | none | Section, text, tag phụ |
| 1 | `3px 3px` | Chip, badge nhỏ, input helper |
| 2 | `4px 4px` | Button, card nhỏ, bubble |
| 3 | `6px 6px` | Card chính, verdict, avatar showcase |
| 4 | `8px 8px` | Stamp, hero card, modal |

**Quy tắc tương tác:**

| State | Transform | Shadow |
|---|---|---|
| Default (md) | none | `4px 4px` |
| Hover | `translate(-2px, -2px)` | `6px 6px` |
| Active | `translate(2px, 2px)` | `2px 2px` |
| Focus | none | `outline: 3px solid var(--c-ink); outline-offset: 3px;` |
| Disabled | none | `3px 3px 0 #8A8678`, bg `#E8E4D8`, text `#8A8678` |

- **Không blur, không glow, không backdrop-filter.**
- **Không shadow mọi card.** Chỉ card chính/interactive mới có shadow ≥ level 2.
- **Không radius full.** Icon button dùng `10px`; avatar frame `12px`; card `16px`; stamp `8px`; chip `8px`.
- Stamp xoay `-8deg` desktop, `-4deg` mobile; text thật trong DOM.
- Focus ring trên nền tối (footer) dùng `--c-bg` thay vì ink.

### 4.5. Pattern & texture

| Pattern | CSS | Dùng cho |
|---|---|---|
| Checkerboard | `conic-gradient` 32px, lemon + kem | Avatar frame |
| Dots | `radial-gradient(var(--c-ink) 1px, transparent 1px)` 12px | Nền section nhẹ |
| Grid | 2 linear-gradient 1px, 32px | Nền card scan |
| Waves | SVG data URI, stroke ink 2px, opacity 0.10 | Landing banner |

**Quy tắc:**

- Pattern chỉ nằm trong khung có border hoặc nền section; không nằm sau text dài.
- Tối đa 1 pattern/section.
- Opacity pattern 0.06–0.12; checkerboard trong avatar frame có thể 0.35–0.5.
- Không dùng ảnh noise/texture nặng.

### 4.6. Motion

```css
:root {
  --dur-fast: 120ms;
  --dur-base: 180ms;
  --dur-slow: 320ms;
  --dur-reveal: 480ms;
  --ease-pop: cubic-bezier(0.2, 0.8, 0.2, 1);
  --ease-stamp: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

| Hiệu ứng | Thời gian | Ghi chú |
|---|---:|---|
| Button press | 120ms | translate + shadow |
| Hover lift | 180ms | -2px |
| Bubble enter | 260ms | stagger 60ms |
| Stamp slam | 420ms | scale 1.6→1, rotate -14→-8 |
| Score count-up | 700ms | dừng ở giá trị thật |
| Scan progress | 200ms | linear |
| Page/phase transition | 260ms | opacity + 8px translate |

- `prefers-reduced-motion: reduce`: tắt transform/scale/confetti/marquee; giữ opacity fade 0.01ms.
- Không infinite animation trừ marquee ticker; ticker dừng khi hover và khi reduced-motion.
- `canvas-confetti` chỉ dynamic import khi tier LEGENDARY/MYTHICAL; không import top-level.

---

## 5. Component inventory & contracts

### 5.1. Layout

| Component | Mô tả | States |
|---|---|---|
| `SiteHeader` | Sticky top, cao 72px, nền kem, border-bottom 3px, logo sticker + nav + CTA | default, scrolled (optional), mobile menu open/closed |
| `SiteFooter` | Nền ink, chữ kem, 3 cột, disclaimer | default |
| `PageShell` | Container + section spacing + background pattern | default |
| `MobileMenu` | Panel full-width, border 3px, link stack, Escape đóng | open/closed |
| `SkipLink` | “Bỏ qua tới nội dung” | focus |

**Header:**

- Logo: ô vuông lemon 40×40, border 3px, shadow 3px, chữ “AR” display 800; wordmark “AVATAR RANKED” display 18; tagline mono 10 “ROAST • RATE • RANK”.
- Nav landing: “CÁCH HOẠT ĐỘNG”, “BẢNG ĐIỂM”, “FAQ”.
- Nav scan: “TRANG CHỦ”, “SCAN MỚI”.
- CTA: `Button` primary size `sm` “CHẤM AVATAR” → `/scan`.
- Mobile: logo + CTA + menu button 44×44; menu panel dưới header, border 3px, shadow 4px.
- Sound toggle: icon-only 44×44, `aria-pressed`, chỉ hiện desktop; mobile trong menu. Mặc định **muted** để tránh bất ngờ; lưu localStorage.

**Footer:**

- 3 cột desktop: brand + tagline; link (Landing, Scan, FAQ, GitHub?); disclaimer.
- Disclaimer: “Không liên kết, không được Roblox Corporation bảo trợ. Chỉ mang tính giải trí.”
- Copyright năm hiện tại; server component để tránh hydration mismatch (hoặc hard-code năm build).

### 5.2. Primitives

#### `Button`

```ts
type ButtonVariant = "primary" | "secondary" | "accent" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";
interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
  asChild?: boolean; // hoặc render <a> riêng
}
```

| Thuộc tính | Giá trị |
|---|---|
| Base | inline-flex, gap 8px, border 3px ink, radius 12px, font body 700 uppercase, letter-spacing 0.04em, cursor pointer, transition 180ms |
| `sm` | min-height 40px, padding 10px 14px, font 12px |
| `md` | min-height 48px, padding 14px 20px, font 14px |
| `lg` | min-height 56px, padding 18px 28px, font 16px |
| Primary | bg coral, text ink |
| Secondary | bg surface, text ink |
| Accent | bg lemon, text ink |
| Ghost | bg transparent, border 2px, no shadow; hover bg surface-2 |
| Danger | bg danger-bg, text danger |
| Hover | translate(-2,-2), shadow +2px |
| Active | translate(2,2), shadow -2px |
| Focus | outline 3px ink, offset 3px |
| Disabled | bg #E8E4D8, text #8A8678, border #8A8678, shadow 3px #8A8678, no transform, cursor not-allowed |
| Loading | spinner 16px + label, `aria-busy="true"`, giữ nguyên width |

#### `Input` / `UsernameForm`

- Form max-width 720px, margin auto.
- Label mono 12 uppercase “ROBLOX USERNAME”; helper text dưới.
- Desktop: flex row, input flex-1 + button `lg`; gap 12px.
- Mobile: column, button full width.
- Input: height 60px desktop / 56px mobile; border 3px ink; radius 12px; shadow 4px; bg white; padding 0 16px 0 44px; prefix `@` mono 20 absolute left 16; font 18/20; placeholder muted.
- Focus: `outline: 3px solid ink; outline-offset: 3px;` + shadow 6px.
- Invalid: border danger, bg danger-bg, helper text danger + icon; `aria-invalid="true"`.
- Disabled/loading: opacity 0.6, readOnly, cursor wait.
- Helper mặc định: “Chỉ đọc dữ liệu công khai. Không cần đăng nhập.”
- Error thay helper, `role="alert"`, `aria-describedby`.
- Validate: trim, regex `/^[A-Za-z0-9_]{3,20}$/`; chỉ báo lỗi sau blur/submit; maxLength 20; autoComplete off; spellCheck false.
- Example chips: `@builderman`, `@Roblox`, `@Linkmon99`, `@KreekCraft`; border 2px, shadow 3px, radius 8px; hover lift; click **fill + submit** (hoặc fill only — chốt ở decision).
- Submit button: “QUÉT AVATAR” / loading “ĐANG TÌM...” + spinner; disabled khi rỗng/loading.
- `aria-live="polite"` cho trạng thái tìm kiếm.

#### `Card`

- `surface`: white; `accent`: lemon/mint/violet/cyan; `flat`: no shadow.
- Border 3px ink, radius 16px, shadow 6px (level 3) cho card chính; padding 24px desktop / 20px mobile.
- Không hover nếu static; nếu clickable: hover -2/-2 shadow 8; active +2/+2 shadow 4.
- Có thể có `rotate` prop cho sticker card (-2deg / 2deg), nhưng không xoay card chứa text dài.

#### `Badge` / `Chip` / `Tag`

- Border 2px ink, radius 8px, shadow 3px, font mono 11–12 uppercase, padding 4px 8px.
- Variants: `tier` (màu theo tier), `neutral` (surface-2), `outline` (transparent), `accent` (lemon/mint/coral/violet/cyan).
- Không dùng pill full; radius 8px.
- Verified badge: icon `BadgeCheck` 16px, `aria-label="Đã xác minh"`.

#### `Stamp`

```ts
interface StampProps {
  label: string;
  tone: "roast" | "praise" | "legendary" | "mythical" | "neutral";
  size?: "sm" | "md" | "lg";
  rotation?: number;
  animate?: boolean;
}
```

- Kích thước: `sm` 96px, `md` 128px, `lg` 160px.
- Border 3px ink; inner border 2px ink inset 5px (pseudo `::before`); radius 8px; bg accent; text ink; display 800 uppercase; line-height 0.95; text-align center; padding 12px.
- Tone: roast = coral, praise = mint, legendary = lemon, mythical = coral, neutral = surface-2.
- Rotation mặc định -8deg; mobile -4deg.
- Animation stamp slam khi reveal; result static.
- Text là text node thật, không phải background; `aria-label` nếu cần giải thích.

#### `SpeechBubble`

```ts
interface SpeechBubbleProps {
  tone: "praise" | "roast" | "tip" | "neutral";
  speaker: string;
  children: ReactNode;
  tail?: "left" | "right" | "bottom";
}
```

- Bubble: bg tint, border 3px ink, radius 12px, shadow 4px, padding 16px 20px, max-width 560px.
- Accent strip 6px bên trái (praise mint, roast coral, tip cyan).
- Tail: pseudo-element 18×18px, rotate 45deg, border-left/bottom 3px ink, fill cùng màu bubble; đặt bottom-left/right; mobile luôn bottom-left.
- Header: mono 11 uppercase speaker + optional icon; body 16/1.55.
- Desktop: xen kẽ trái/phải; mobile: full width, tail bottom-left.
- Enter: opacity + translateY 12px, 260ms, stagger 60ms.
- Không render nếu text rỗng; fallback text neutral.

#### `ScoreDisplay`

- Score chính: display 800, `--fs-5xl`, tabular-nums, line-height 0.9; `/10` nhỏ 24px mono.
- Label trên: mono 12 uppercase “FINAL VERDICT”.
- `aria-label`: “85 trên 100, tương đương 8.5 trên 10”.
- Count-up 700ms; reduced-motion hiển thị ngay.
- Nếu score âm/NaN: clamp 0–100, hiển thị `0.0`.

#### `ProgressBar`

- Track: bg surface-2, border 2px ink, radius 8px, height 16px, padding 2px.
- Fill: bg coral (hoặc lemon), height 100%, border-radius 4px, transition width 200ms.
- Label: mono 12, `%` bên phải.
- `role="progressbar"`, `aria-valuenow/min/max`, `aria-label`.

#### `Alert`

- Variants: danger, warning, success, info.
- Border 3px ink, shadow 4px, radius 12px, padding 16px; icon 20px; title body 700; text 14/1.5.
- `role="alert"` cho error; `role="status"` cho success.
- Có action “Thử lại” optional.

#### `Skeleton`

- Nền surface-2, border 2px line-soft, radius 8px; shimmer nhẹ hoặc stripe; `aria-hidden`; wrapper `aria-busy`.
- Không dùng blur.
- Kích thước khớp component thật để tránh layout shift.

#### `SectionHeading`

- Eyebrow mono 12 uppercase accent; H2 display `--fs-3xl`; description body 18 max-width 65ch.
- Căn trái mặc định; center cho landing section.

### 5.3. Domain components

| Component | Vai trò | Data |
|---|---|---|
| `AvatarFrame` | Khung avatar + checkerboard + tag username + fallback | `RobloxUser`, `imageUrl` |
| `TargetCard` | Avatar + tên + verified + nút đổi username | `RobloxUser` |
| `PersonalTasteControl` | 6 nấc gu cá nhân (COMMON→MYTHICAL) | `personalTier`, `onChange` |
| `ScanTheatre` | Avatar + progress + trạng thái quét | `phase`, `progress` |
| `VerdictHero` | Score + stamp + tier + quote | `ScoreReport`, `imageUrl` |
| `VerdictBubbles` | 2–3 bubble praise/roast/tip | `ScoreReport` |
| `CriteriaGrid` | 4 tiêu chí AI + personal | `ScoreReport` |
| `StyleTagsPanel` | Aesthetic/cosplay/fandom/category tags | `ScoreReport` |
| `CosplayPanel` | Chi tiết cosplay (collapsible) | `ScoreReport` |
| `RobuxPanel` | Giá catalog + excluded items (collapsible) | `ScoreReport` |
| `ImprovementPanel` | Strengths/weaknesses/next tier/mythical advice | `ScoreReport` |
| `ActionBar` | Roast lại/copy/share/Roblox/new search | callbacks |
| `DataQualityBanner` | Cảnh báo dữ liệu thiếu | `dataQuality` |
| `ShareCard` | Card Polaroid để export (phase 2) | `VerdictView` |

---

## 6. Page IA

### 6.0. Wireframe tổng quát

**Landing desktop:**

```text
+------------------------------------------------------------------+
| [AR] AVATAR RANKED     CÁCH HOẠT ĐỘNG  BẢNG ĐIỂM  FAQ  [CHẤM]    |
+------------------------------------------------------------------+
|                                                                    |
|  ROBLOX AVATAR ROAST & RATE              +----------------------+  |
|  AVATAR CỦA BẠN CÓ DRIP KHÔNG?           |  checkerboard avatar |  |
|  Subcopy ngắn...                         |  @builderman         |  |
|  [CHẤM AVATAR CỦA TÔI] [XEM CÁCH...]     |  8.5/10   [STAMP]    |  |
|  Miễn phí • Không cần đăng nhập          +----------------------+  |
|                                                                    |
+------------------------------------------------------------------+
|  ROAST • RATE • RANK • REPEAT  (ticker)                           |
+------------------------------------------------------------------+
|  01 NHẬP          02 SOI            03 NHẬN VERDICT               |
|  [card]           [card]            [card]                        |
+------------------------------------------------------------------+
|  KẾT QUẢ MẪU: [verdict card + stamp + 2 bubble]                   |
+------------------------------------------------------------------+
|  6 BẬC DRIP: [COMMON] [UNCOMMON] [RARE] [EPIC] [LEGENDARY] [MYTH] |
+------------------------------------------------------------------+
|  FAQ (details)                                                    |
+------------------------------------------------------------------+
|  SẴN SÀNG BỊ ROAST?  [CHẤM NGAY]                                  |
+------------------------------------------------------------------+
|  Footer ink + disclaimer                                          |
+------------------------------------------------------------------+
```

**Scan page — entry:**

```text
+------------------------------------------------------------------+
| [AR] AVATAR RANKED                              [TRANG CHỦ]       |
+------------------------------------------------------------------+
|                                                                    |
|  NHẬP USERNAME ROBLOX                                             |
|  Tôi sẽ soi avatar của bạn, chấm điểm và nói thật.                |
|                                                                    |
|  [@  ví dụ: builderman ........................] [QUÉT & CHẤM]   |
|  Chỉ đọc dữ liệu công khai. Không cần đăng nhập.                  |
|  Thử nhanh: [@builderman] [@Roblox] [@Linkmon99] [@KreekCraft]    |
|                                                                    |
|  +----------------------+  +----------------------+               |
|  | 1. Nhập username     |  | 2. Hệ thống soi      |  ...          |
|  +----------------------+  +----------------------+               |
+------------------------------------------------------------------+
```

**Scan page — result:**

```text
+------------------------------------------------------------------+
| [AR] AVATAR RANKED                              [SCAN MỚI]        |
+------------------------------------------------------------------+
|  [data quality banner nếu thiếu dữ liệu]                          |
+------------------------------------------------------------------+
|  +----------------+   +----------------------------------------+  |
|  |  avatar frame  |   | FINAL VERDICT      8.5/10   [STAMP]    |  |
|  |  @username     |   | LEGENDARY • "Your fit belongs..."      |  |
|  +----------------+   | 4 tiêu chí + điểm gu                   |  |
|                       +----------------------------------------+  |
+------------------------------------------------------------------+
|  [bubble praise]        [bubble roast]        [bubble tip]        |
+------------------------------------------------------------------+
|  Criteria grid / Style tags / Cosplay / Robux / Improvement       |
|  (accordion; mở Criteria, đóng phần còn lại)                      |
+------------------------------------------------------------------+
|  [ROAST LẠI] [COPY] [CHIA SẺ] [MỞ ROBLOX]     QUÉT USERNAME KHÁC  |
+------------------------------------------------------------------+
```

### 6.1. Landing `/` (không có input username)

| # | Section | Nội dung | Ghi chú |
|---|---|---|---|
| 1 | Header | Logo, nav, CTA “CHẤM AVATAR” | Sticky |
| 2 | Hero | H1 + subcopy + CTA + sample Polaroid + sticker | Không gọi API |
| 3 | Ticker | “ROAST • RATE • RANK • REPEAT” | Marquee, dừng hover |
| 4 | How it works | 3 bước: Nhập username → Quét dữ liệu → Nhận verdict | Link tới `/scan` |
| 5 | Verdict preview | Sample verdict card + stamp + 2 bubble | Static, ghi “Kết quả mẫu” |
| 6 | Rarity guide | 6 tier cards từ `RARITIES_LIST` | Horizontal snap mobile |
| 7 | FAQ | 5 câu hỏi | `<details>` |
| 8 | Final CTA | Panel coral + “SẴN SÀNG BỊ ROAST?” | Link `/scan` |
| 9 | Footer | Disclaimer | Ink bg |

**Hero copy đề xuất:**

- Eyebrow: `ROBLOX AVATAR ROAST & RATE`
- H1: `AVATAR CỦA BẠN CÓ DRIP KHÔNG?`
- Sub: `Nhập username Roblox. Nhận điểm, con dấu verdict và một tràng roast (hoặc khen) trong vài giây.`
- CTA chính: `CHẤM AVATAR CỦA TÔI`
- CTA phụ: `XEM CÁCH HOẠT ĐỘNG`
- Microcopy: `Miễn phí • Không cần đăng nhập • Chỉ dùng dữ liệu công khai`

**Sample card (static):**

- Avatar minh họa blocky (SVG nội bộ) trên checkerboard lemon.
- Tag `@builderman`.
- Score `8.5/10`.
- Stamp `DRIP OVERFLOW` (coral).
- Bubble `“Outfit này có chủ đích. Tôi hơi sợ.”`
- Sticker ngôi sao/lightning bằng SVG.

### 6.2. Scan page `/scan`

**State machine giữ nguyên:**

```ts
type ScanPhase =
  | "idle"       // entry form
  | "searching"  // đang lookup user
  | "found"      // đã có user, chọn gu
  | "init"       // bắt đầu scan
  | "scanning"   // đang fetch profile/catalog/palette
  | "calculating"// tính điểm
  | "revealing"  // verdict reveal
  | "done"       // result
  | "error";     // lỗi
```

| Phase | UI |
|---|---|
| `idle`, `searching`, `error` | `ScanEntry`: H1, form, examples, privacy, mini how-it-works |
| `found` | `TargetCard` + `PersonalTasteControl` + CTA “ROAST & CHẤM ĐIỂM” + “Đổi username” |
| `init`, `scanning`, `calculating` | `ScanTheatre`: avatar, progress, 3 bước thật, nút “Bỏ qua” |
| `revealing` | `VerdictReveal`: stamp slam, score count-up, 1 bubble, CTA “XEM CHI TIẾT” |
| `done` | `ResultPanel` + `ActionBar` |
| `error` | `Alert` + retry + giữ username |

**Scan entry copy:**

- H1: `NHẬP USERNAME ROBLOX`
- Sub: `Tôi sẽ soi avatar của bạn, chấm điểm và nói thật. Không cần đăng nhập.`
- Placeholder: `ví dụ: builderman`
- Button: `QUÉT & CHẤM ĐIỂM`
- Examples label: `Thử nhanh:`
- Privacy: `Chỉ đọc dữ liệu công khai từ Roblox API. Không lưu mật khẩu, không đăng nhập.`

**URL sync:**

- Sau khi lookup thành công: `router.replace("/scan?u=" + encodeURIComponent(user.name))`.
- Khi vào `/scan?u=...`: prefill input và **auto lookup** (không auto scan) → hiện `found`.
- Nếu `u` invalid/404: hiện entry + alert, không crash.
- Không dùng effect phụ thuộc `searchParams` để tránh vòng lặp; chỉ sync trong event handler.
- Refresh giữa result: re-fetch từ đầu (không cache result), hiện entry với username prefill.

**Personal Taste Control:**

- 6 nấc: COMMON 0, UNCOMMON 15, RARE 35, EPIC 60, LEGENDARY 80, MYTHICAL 100.
- **Mặc định: “Chưa chọn” (`null`)** — không nấc nào được highlight; không tự gán COMMON.
- Desktop: hàng ngang, mỗi nấc là button 44px + label mono 10 + điểm.
- Mobile: 2 hàng 3 nấc hoặc horizontal scroll snap; không dùng slider opacity 0 khó tiếp cận.
- Selected: bg accent tier, border 3px ink, shadow 3px, scale 1.05.
- Có nhãn “AI” ở nấc hệ thống đã tính (nếu đã có report).
- Hiển thị giải thích:
  - Khi chưa chọn: “Chưa chọn gu. Điểm tổng sẽ tính 100% từ hệ thống.”
  - Khi đã chọn: “Gu của bạn chiếm 25% tổng điểm.”
- Có nút “Bỏ chọn” / “Để hệ thống chấm” để quay về trạng thái `null`.
- **Đã chốt:** không còn cảnh báo default COMMON. Khi `null`, điểm tổng = `aiScore` (100% hệ thống).

**Scan Theatre:**

- Card trắng, border 3px, shadow 6px, pattern grid nhẹ.
- Avatar frame 280–320px, checkerboard; scan bar ngang màu coral/lemon chạy từ trên xuống (hard edge, không glow).
- Progress bar + `%` + status text thật:
  - `Đang lấy dữ liệu avatar...`
  - `Đang đối chiếu 270 aesthetics...`
  - `Đang tính điểm và kiểm tra dữ liệu...`
- 3-step checklist với icon check/loader.
- Nút “Bỏ qua animation” ghost.
- Không dùng telemetry giả (“NODE: SG-01”, “AI SYSTEM ACTIVE”) trừ khi có dữ liệu thật.
- `aria-live="polite"` cho status; `role="progressbar"`.

**Verdict Reveal:**

- Card mint hoặc white, stamp coral slam chéo góc.
- Score count-up; tier label; quote.
- 1 bubble ngắn (praise/roast theo tone).
- Confetti chỉ LEGENDARY/MYTHICAL, dynamic import, tắt reduced-motion.
- Nút “XEM CHI TIẾT” → done.

**Result Panel:**

1. `DataQualityBanner` (nếu incomplete).
2. `VerdictHero`: avatar + score + stamp + tier + quote + user.
3. `VerdictBubbles`: 2–3 bubble.
4. `CriteriaGrid`: 4 AI criteria + personal; weight labels; score bars.
5. `PersonalTastePanel`: cho chỉnh lại gu, cập nhật score realtime.
6. `StyleTagsPanel` + `CosplayPanel` (collapsible).
7. `RobuxPanel` (collapsible).
8. `ImprovementPanel` (collapsible).
9. `Limitations` (collapsible, nhỏ).
10. `ActionBar`.

- Không render một `ResultCard` 800 dòng; mỗi panel là component riêng.
- Dùng `<details>` hoặc accordion có `aria-expanded`; mặc định mở Criteria, đóng Cosplay/Robux/Improvement.
- Khi đổi personal taste: cập nhật score + stamp + bubble (nếu stamp phụ thuộc tier) realtime; không cuộn trang.

### 6.3. Score & stamp mapping

**Hiển thị điểm:**

- Điểm chính: `(total / 10).toFixed(1)` + `/10` (ví dụ `8.5/10`).
- Trong criteria/breakdown: `total` gốc `/100` để khớp dữ liệu.
- `aria-label`: “85 trên 100, tương đương 8.5 trên 10”.
- Lý do: giữ nguyên scoring 0–100, chỉ format hiển thị; không đổi test/logic.

**Trạng thái “Chưa chọn gu”:**

- `personalTier = null`, `personalScore = null`, `personalWeight = 0`, `aiWeight = 1`.
- `total = aiScore` (100% điểm hệ thống), không bị trừ 25%.
- `criteria.personal.score = null`, `weight = 0`; UI hiển thị “Chưa chọn” thay vì `0/100`.
- Copy trong Result: “Gu cá nhân: Chưa chọn — điểm tính 100% từ hệ thống.”
- Khi người dùng chọn một nấc: quay lại công thức `aiScore * 0.75 + personalScore * 0.25`.
- Khi bấm “Bỏ chọn”: quay lại `null` và tính lại realtime.

**Tier → stamp (MVP, deterministic):**

| Tier | Điều kiện điểm | Stamp | Tone |
|---|---:|---|---|
| COMMON | 0–14 | `NEEDS WORK` | roast |
| UNCOMMON | 15–34 | `NOT BAD` | neutral |
| RARE | 35–59 | `CERTIFIED DRIP` | praise |
| EPIC | 60–79 | `MAIN CHARACTER` | praise |
| LEGENDARY | 80–91 | `HALL OF FAME` | legendary |
| MYTHICAL | 92–100 | `AVATAR GOD` | mythical |

**Quy tắc phụ (phase 2, optional):**

- Nếu `cosplayResult.identificationStatus === "confirmed"` → stamp `COSPLAY CONFIRMED` (ưu tiên sau tier).
- Nếu `criteria.humor.score >= 80` và tier < EPIC → stamp `MEME LORD`.
- Nếu `criteria.value.score <= 20` và tier < RARE → stamp `BUDGET FIT`.
- Nếu data quality `insufficient` → stamp `DATA CHECK` + warning banner.
- Tất cả mapping nằm trong `getVerdictView(report)` thuần, có unit test.

**Bubble selection:**

- Bubble 1 (praise): `strengths[0]` → fallback `rarity.description`.
- Bubble 2 (roast): `weaknesses[0]` → fallback `limitations[0]` → fallback “Không có gì để chê. Đáng ngờ.”
- Bubble 3 (tip): `outfitRecommendations[0]` → fallback `nextTier?.steps[0]` → fallback `mythicalAdvice[0]`.
- Nếu `cosplayResult.characterName`: thêm bubble `COSPLAY: {name} ({franchise})`.
- Tối đa 3 bubble; cắt text > 180 ký tự tại ranh giới từ; không cắt giữa emoji.
- Speaker labels: `THE JUDGE` (praise), `THE ROASTER` (roast), `THE STYLIST` (tip), `THE CURATOR` (cosplay).
- Không bịa nội dung mới ngoài data; nếu thiếu data, dùng fallback đã định nghĩa.

### 6.4. Error / loading / empty matrix

| Tình huống | UI | Hành động |
|---|---|---|
| Username rỗng | Helper “Nhập username để bắt đầu.” | Focus input |
| Sai format | Inline error dưới input | Giữ value, focus |
| 404 | `Alert danger`: “Không tìm thấy username này. Kiểm tra chính tả nhé.” | Retry, example chips |
| 429 | `Alert warning`: “Roblox đang giới hạn truy cập. Thử lại sau 1–2 phút.” | Retry disabled 60s |
| 5xx/network | `Alert danger`: “Không kết nối được Roblox.” | Retry |
| Thumbnail null | Avatar fallback blocky + chip “Ảnh không tải được” | Vẫn cho scan |
| Profile fetch fail | `Alert danger` + “Thử lại” | Quay lại found |
| Catalog fail | `DataQualityBanner` vàng: “Không lấy được giá catalog; điểm giá trị tạm tính 0.” | Vẫn hiện result |
| Scan > 8s | Status “Vẫn đang xử lý...” + skip | Skip |
| Scan > 20s | `Alert warning` + “Thử lại” | Reset |
| Report thiếu mảng | Ẩn section hoặc fallback neutral | Không blank |
| Copy fail | Toast “Không copy được. Chọn và copy thủ công.” | Fallback |
| Share fail | Fallback copy | Toast |
| Ảnh lỗi | `onError` → fallback | Không vỡ layout |
| JS off | `<noscript>`: “Bật JavaScript để quét avatar.” | Link về landing |
| Offline | Alert + retry | Browser event optional |

### 6.5. Responsive rules

| Vùng | Mobile (<640) | Tablet (640–1023) | Desktop (≥1024) |
|---|---|---|---|
| Landing hero | 1 cột; CTA trước, sample sau | 1 cột, sample lớn hơn | 7/5 cột, sample bên phải |
| Header | Logo + CTA + menu | Logo + nav + CTA | Full nav + sound |
| Input | Stack dọc, button full width | Row | Row, max 720px |
| Avatar frame | `min(78vw, 300px)` | 320px | 360px |
| Score | 64–80px | 80–96px | 96–120px |
| Stamp | Static dưới score, -4deg | Static | Absolute top-right, -8deg |
| Result grid | 1 cột | 1 cột | 5/7 hoặc 12-col |
| Action bar | 2×2 grid | 4 cột | 4 cột |
| Rarity guide | Horizontal scroll snap | 2 cột | 3 cột |
| Bubbles | Full width, tail bottom-left | Xen kẽ | Xen kẽ |
| Patterns | Giảm opacity, ẩn sticker phụ | Vừa | Full |

- Touch target ≥44×44px.
- Input font-size ≥16px trên iOS.
- Không horizontal scroll; test 320px.
- Stamp/rotated sticker dùng wrapper `overflow-visible`, section `overflow-hidden` để không tràn.

### 6.6. Accessibility

- Skip link đầu trang.
- Mỗi trang một `h1`; section `h2`; card `h3`.
- Form: `<label>`, `aria-invalid`, `aria-describedby`, error `role="alert"`.
- Progress: `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-label`.
- Phase changes: `aria-live="polite"` + focus vào heading mới (không cướp focus khi đang gõ).
- Ảnh: alt “Avatar Roblox của {displayName}”; decorative `alt=""` + `aria-hidden`.
- Stamp: text thật, không chỉ pseudo; nếu xoay, vẫn đọc được.
- Tier: không chỉ dùng màu; luôn có label + icon.
- Keyboard: tab order hợp lý; menu Escape; accordion `aria-expanded`; slider là button group hoặc range có label.
- Focus-visible rõ ràng; không `outline: none` nếu không thay thế.
- Reduced motion: tắt confetti/marquee/transform; vẫn có fade.
- Sound: mặc định muted; toggle có `aria-pressed`; không autoplay.
- Contrast: tuân bảng 4.1; kiểm tra text trên accent.
- Ngôn ngữ: `lang="vi"`; stamp tiếng Anh có thể thêm `aria-label` tiếng Việt nếu cần.

---

## 7. Migration map — component cũ → mới

| Cũ | Mới | Ghi chú |
|---|---|---|
| `Header.tsx` | `layout/SiteHeader.tsx` + `MobileMenu` | Bỏ glass/blur, thêm CTA |
| `Hero.tsx` | `landing/LandingHero.tsx` | Tách khỏi workspace |
| `UsernameSearch.tsx` | `scan/ScanEntry.tsx` + `ui/Input` + `ui/Button` | Giữ validation/API |
| `AvatarFoundCard.tsx` | `scan/TargetCard.tsx` + `scan/PersonalTasteControl.tsx` | Bỏ hologram |
| `AvatarScanner.tsx` | `scan/ScanTheatre.tsx` | Bỏ telemetry giả |
| `RarityReveal.tsx` | `scan/VerdictReveal.tsx` | Stamp slam, confetti lazy |
| `ResultCard.tsx` | `scan/ResultPanel.tsx` + 9 panel con | Chia nhỏ |
| `ScoreBreakdown.tsx` | `scan/CriteriaGrid.tsx` + `ui/CriterionCard` | Giữ data |
| `PersonalTasteSlider.tsx` | `scan/PersonalTasteControl.tsx` | Button group, không slider ẩn |
| `HowItWorks.tsx` | `landing/HowItWorks.tsx` | Restyle |
| `RarityGuide.tsx` | `landing/RarityGuide.tsx` | Dùng tier theme mới, bỏ gradient |
| `Footer.tsx` | `layout/SiteFooter.tsx` | Ink bg |
| `AvatarPreview.tsx` | Xóa (không dùng) | Kiểm tra import |
| `ScanProgress.tsx` | Xóa hoặc thay bằng `ui/ProgressBar` | Không dùng |
| `motion.ts` | Giữ, bổ sung variant mới | Không đổi logic |
| `sound.ts` | Giữ, optional | Mặc định muted |
| `globals.css` neon | `styles/tokens.css` + `styles/neo.css` | Xóa class cũ cuối |
| `tailwind.config.ts` | Semantic tokens mới | Giữ Tailwind 3 |

---

## 8. Cấu trúc file đề xuất

```text
src/
  app/
    layout.tsx                 # fonts, metadata, theme color
    page.tsx                   # landing (server component)
    scan/
      page.tsx                 # server wrapper + Suspense
      ScanWorkspace.tsx        # client, dùng hook
    globals.css                # tailwind + base + import tokens
    opengraph-image.tsx        # OG image (phase 2)
    icon.svg
  components/
    layout/
      SiteHeader.tsx
      SiteFooter.tsx
      MobileMenu.tsx
      PageShell.tsx
      SkipLink.tsx
    ui/
      Button.tsx
      Card.tsx
      Badge.tsx
      Stamp.tsx
      SpeechBubble.tsx
      Input.tsx
      ProgressBar.tsx
      Skeleton.tsx
      Alert.tsx
      SectionHeading.tsx
      ScoreDisplay.tsx
      AvatarFrame.tsx
      Accordion.tsx
    landing/
      LandingHero.tsx
      Ticker.tsx
      HowItWorks.tsx
      VerdictPreview.tsx
      RarityGuide.tsx
      FAQ.tsx
      FinalCTA.tsx
    scan/
      ScanEntry.tsx
      TargetCard.tsx
      PersonalTasteControl.tsx
      ScanTheatre.tsx
      VerdictReveal.tsx
      ResultPanel.tsx
      DataQualityBanner.tsx
      VerdictHero.tsx
      VerdictBubbles.tsx
      CriteriaGrid.tsx
      StyleTagsPanel.tsx
      CosplayPanel.tsx
      RobuxPanel.tsx
      ImprovementPanel.tsx
      ActionBar.tsx
      ShareCard.tsx            # phase 2
  hooks/
    useAvatarScan.ts           # tách logic từ page.tsx, giữ nguyên behavior
  lib/
    ui/
      cn.ts
      verdict.ts               # getVerdictView, stamp, bubble selection
      format.ts                # formatScore10, formatRobux
      tierTheme.ts             # tier -> accent class
    mock/
      mockReport.ts            # fixture dev-only
  styles/
    tokens.css
    neo.css                    # pattern, stamp, bubble tail, marquee
```

> `useAvatarScan` chỉ được tách **sau khi UI chạy ổn** hoặc tách song song với test manual đầy đủ. Nếu muốn giảm rủi ro tối đa, giữ nguyên state machine trong `ScanWorkspace.tsx` ở lần đầu, chỉ chia component con; tách hook ở Phase 4.

---

## 9. Kế hoạch thực thi

### Phase 0 — Checkpoint, chốt quyết định & scoring contract (0.5–1 ngày)

- [ ] Commit/stash toàn bộ working tree; tạo branch `rebuild/neo-brutalist`; tag `pre-neo-brutalist`.
- [ ] Chốt các quyết định ở Mục 11 (đã chốt 1, 2, 3, 4).
- [ ] Chạy baseline: `npm run build`, `npm test`; lưu kết quả.
- [ ] Tạo fixture `mockReport` + dev flag để phát triển UI không phụ thuộc Roblox API.
- [ ] Tạo route `/preview` và `/preview/scan` (chỉ dùng trong lúc rebuild).
- [ ] **Scoring contract cho “Chưa chọn gu”** (approved exception):
  - [ ] `PersonalTierSelection = RarityTier | null`.
  - [ ] `calculateAvatarRank(..., personalTier: RarityTier | null = "COMMON")` — giữ default `"COMMON"` để không phá test cũ; UI luôn truyền `null` khi chưa chọn.
  - [ ] Khi `null`: `personalScore = null`, `personalWeight = 0`, `aiWeight = 1`, `total = aiScore`, `criteria.personal.score = null`.
  - [ ] Khi đã chọn: giữ nguyên `75% AI + 25% gu`.
  - [ ] `ScoreReport.personalTier` và `personalScore` cho phép `null`.
  - [ ] Cập nhật `nextTier` advice để không so sánh `null < 80`.
  - [ ] Thêm test: `null` → total = aiScore; selected → đúng công thức 75/25; `null` không làm vỡ rarity.
  - [ ] Không sửa các test cũ; chỉ thêm test mới.

**Gate:** baseline pass; test cũ vẫn pass; test `null` mới pass; typecheck pass.

### Phase 1 — Tokens & primitives (1–1.5 ngày)

- [ ] `styles/tokens.css`: colors, type, spacing, shadow, radius, motion.
- [ ] `tailwind.config.ts`: map semantic tokens; xóa neon colors/glow.
- [ ] `layout.tsx`: 3 font mới, metadata, themeColor `#FFFDF5`.
- [ ] `globals.css`: reset, base, focus-visible, selection, reduced-motion.
- [ ] `neo.css`: checkerboard, dots, grid, stamp, bubble tail, marquee.
- [ ] Primitives: `Button`, `Card`, `Badge`, `Stamp`, `SpeechBubble`, `Input`, `ProgressBar`, `Skeleton`, `Alert`, `SectionHeading`, `ScoreDisplay`, `AvatarFrame`, `Accordion`.
- [ ] Story/demo page `/preview` hiển thị tất cả primitive + state (default/hover/active/focus/disabled/loading/error) để QA.

**Gate:** `/preview` render đúng token; không còn hard-code hex ngoài tokens; build pass.

### Phase 2 — Landing page (1.5–2 ngày)

- [ ] `SiteHeader`, `SiteFooter`, `MobileMenu`.
- [ ] `LandingHero` + sample Polaroid + sticker SVG.
- [ ] `Ticker`, `HowItWorks`, `VerdictPreview`, `RarityGuide`, `FAQ`, `FinalCTA`.
- [ ] Copy tiếng Việt + English stamp.
- [ ] Responsive 320 → 1440.
- [ ] Metadata + OG image + favicon.
- [ ] Swap `/` khi landing đạt QA; giữ `/preview` để so sánh.

**Gate:** landing không có input username; CTA → `/scan`; Lighthouse mobile ≥ 85 performance, ≥ 95 accessibility.

### Phase 3 — Scan workspace (2–3 ngày)

- [ ] `/scan` page + Suspense + URL sync `?u=`.
- [ ] `ScanEntry` (form, validation, examples, errors).
- [ ] `TargetCard` + `PersonalTasteControl` với trạng thái **“Chưa chọn”** mặc định.
- [ ] `ScanTheatre` (progress, real status, skip).
- [ ] `VerdictReveal` (stamp slam, count-up, confetti lazy).
- [ ] `ResultPanel` + `VerdictHero` + `VerdictBubbles` + `CriteriaGrid`.
- [ ] Collapsible panels: Style/Cosplay/Robux/Improvement/Limitations.
- [ ] `ActionBar` (roast lại, copy, share, Roblox, new search).
- [ ] Error/loading/empty states đầy đủ.
- [ ] Gọi `calculateAvatarRank` với `null` khi chưa chọn; giữ nguyên API calls, race-condition guard.
- [ ] Khi đổi gu hoặc bấm “Bỏ chọn”: tính lại realtime, cập nhật score/stamp/bubble.

**Gate:** đi hết flow idle → searching → found → scanning → revealing → done → rescan → new search; error 404/429/network; refresh/deep link.

### Phase 4 — Polish, accessibility, performance (1 ngày)

- [ ] Responsive QA 320/360/390/768/1024/1440.
- [ ] Keyboard-only flow; focus management; aria-live.
- [ ] Reduced motion; contrast audit.
- [ ] Lazy-load confetti; tối ưu ảnh/font; kiểm tra CLS/LCP.
- [ ] Xóa component cũ không dùng; xóa `AvatarPreview`, `ScanProgress`.
- [ ] Xóa class neon/glass cũ khỏi `globals.css`.
- [ ] Chạy `npm run build`, `npm test`; thêm unit test cho `verdict.ts`, `format.ts`.

**Gate:** không còn import component cũ; build/test pass; a11y checklist pass.

### Phase 5 — Cleanup & optional export (0.5–1 ngày)

- [ ] Xóa route `/preview` (hoặc giữ sau flag dev).
- [ ] Cập nhật README/DESIGN.md thành spec v2.
- [ ] (Optional) Export ảnh share card:
  - Ưu tiên `next/og` route `/api/share-card` render PNG từ query params; tránh CORS ảnh Roblox.
  - Hoặc proxy ảnh qua `/api/roblox/image` rồi dùng `html-to-image`.
  - Nếu chưa làm, Action Bar chỉ có copy/share text + URL, ghi rõ “Sắp có ảnh”.
- [ ] Deploy preview; QA lần cuối; merge.

**Tổng effort ước tính:** 6–9 ngày làm việc cho 1 dev, tùy mức độ chi tiết của ResultPanel và export ảnh.

---

## 10. Testing & acceptance criteria

### 10.1. Automated

- [ ] `npm run build` pass.
- [ ] `npm test` pass (36 test hiện có + test mới).
- [ ] `tsc --noEmit` pass (thêm script `typecheck`).
- [ ] Unit test mới:
  - `formatScore10(85) === "8.5"`, clamp 0–100, NaN → `0.0`.
  - `getVerdictStamp` mapping đủ 6 tier + data quality.
  - `selectBubbles` fallback khi mảng rỗng; max 3; truncate.
  - `buildShareText` chứa username, score, tier, URL.
  - `tierTheme` map đủ 6 tier, không trả `undefined`.
  - **`calculateAvatarRank(profile, null, null, null)`**:
    - `personalTier === null`, `personalScore === null`.
    - `personalWeight === 0`, `aiWeight === 1`.
    - `total === aiScore`.
    - `criteria.personal.score === null`.
  - **`calculateAvatarRank(profile, null, null, "RARE")`**:
    - `personalWeight === 0.25`, `aiWeight === 0.75`.
    - `total === round(aiScore * 0.75 + 35 * 0.25)`.
  - Test cũ vẫn pass (default `"COMMON"` giữ nguyên).
- [ ] Không có raw hex ngoài `tokens.css` (review hoặc script grep).

### 10.2. Manual flow matrix

| Case | Kỳ vọng |
|---|---|
| `/` | Landing, không có input username, CTA sang `/scan` |
| `/scan` | Entry form, examples, privacy |
| Username hợp lệ | Searching → Found |
| Username sai format | Inline error, không gọi API |
| Username 404 | Alert, giữ value, retry |
| API 429 | Alert rate limit, retry sau |
| API 500/network | Alert, retry |
| Found → Scan | Progress → Reveal → Result |
| Không chọn gu | `null` → score = 100% hệ thống, UI ghi “Chưa chọn” |
| Chọn gu | Score = 75% AI + 25% gu, UI cập nhật |
| Bỏ chọn gu | Quay về 100% hệ thống, không crash |
| Skip animation | Vào Result không crash |
| Rescan | Tính lại, score cập nhật |
| Đổi personal taste | Score/stamp/bubble cập nhật realtime |
| New search | Reset sạch, focus input, URL sạch |
| Refresh `/scan?u=...` | Prefill + auto lookup, không crash |
| Back/forward | Không loop, state hợp lý |
| Thumbnail null | Fallback, vẫn scan |
| Catalog null | Data quality banner, vẫn result |
| Mobile 320px | Không tràn ngang, stamp không che score |
| Keyboard only | Hoàn thành flow |
| Reduced motion | Không confetti/marquee/transform |

### 10.3. Visual QA checklist

- [ ] Không blur/glow/backdrop-filter.
- [ ] Tất cả border là 2/3/4px ink; shadow hard; không shadow mờ.
- [ ] Accent đúng vai; không quá 2 accent/viewport.
- [ ] Chữ trên cam là ink, không trắng.
- [ ] Radius 8–16px; không pill full.
- [ ] Stamp xoay nhẹ, không che text quan trọng.
- [ ] Bubble tail đúng hướng, không lệch border.
- [ ] Score tabular, không nhảy layout khi count-up.
- [ ] Ảnh avatar `object-contain`, không crop, không méo.
- [ ] Focus ring nhìn thấy trên mọi nền.
- [ ] Mobile không có horizontal scroll.
- [ ] Landing không gọi API; sample card static.

### 10.4. Performance budgets

| Trang | First Load JS | LCP | CLS |
|---|---:|---:|---:|
| `/` landing | ≤ 120 kB | < 2.5s (4G) | < 0.1 |
| `/scan` | ≤ 200 kB | < 2.5s | < 0.1 |

- Confetti dynamic import.
- Font subset latin + vietnamese; chỉ weight cần dùng.
- Ảnh below-fold `loading="lazy"`, `sizes` đúng.
- Landing ưu tiên server component; framer-motion chỉ dùng ở interactive sections.

---

## 11. Quyết định cần chốt trước khi code

| # | Quyết định | Trạng thái | Ghi chú |
|---|---|---|---|
| 1 | Điểm hiển thị | **ĐÃ CHỐT: `8.5/10`** | Breakdown vẫn `/100` |
| 2 | Giữ 6 tier + personal taste? | **ĐÃ CHỐT: Giữ** | Restyle, không bỏ feature 25% |
| 3 | Default personal tier | **ĐÃ CHỐT: “Chưa chọn” (`null`)** | Khi null: 100% điểm hệ thống; khi chọn: 75/25 |
| 4 | Export ảnh | **ĐÃ CHỐT: Phase 2** | MVP copy/share text |
| 5 | Tone roast | Đề xuất: playful, roast outfit | Cần confirm khi viết copy |
| 6 | Sound/confetti | Đề xuất: optional, sound mặc định muted | Cần confirm |
| 7 | Ngôn ngữ | Đề xuất: Việt first + English stamp | Cần confirm |
| 8 | Sample avatar landing | Đề xuất: illustration/SVG nội bộ | Cần confirm |
| 9 | Font | Đề xuất: Bricolage Grotesque + Be Vietnam Pro + JetBrains Mono | Cần confirm |
| 10 | Cách rollout | Đề xuất: branch + `/preview` | Cần confirm |

### 11.1. Scoring contract cho “Chưa chọn” (đã duyệt)

```ts
export type PersonalTierSelection = RarityTier | null;

// Giữ default "COMMON" để không phá test/code cũ.
// UI mới luôn truyền null khi người dùng chưa chọn.
export function calculateAvatarRank(
  profile: RobloxProfile,
  catalog: CatalogSummary | null = null,
  palette: PaletteStats | null = null,
  personalTier: PersonalTierSelection = "COMMON",
): ScoreReport
```

**Khi `personalTier === null`:**

```ts
const personalScore = null;
const personalWeight = 0;
const aiWeight = 1;
const rawTotal = aiScoreNumber;
```

- `criteria.personal.score = null`
- `criteria.personal.weight = 0`
- `criteria.personal.summary` = “Bạn chưa chọn mức đánh giá. Điểm tổng tính 100% từ hệ thống.”
- `ScoreReport.personalTier = null`
- `ScoreReport.personalScore = null`
- `ScoreReport.personalWeight = 0`
- `ScoreReport.aiWeight = 1`
- `total = aiScore`
- `rarity` vẫn tính theo `rawTotal` như cũ.

**Khi `personalTier` là một `RarityTier`:**

- Giữ nguyên công thức hiện tại: `aiScore * 0.75 + personalScore * 0.25`.
- `personalWeight = 0.25`, `aiWeight = 0.75`.

**UI states:**

- `PersonalTasteControl` nhận `value: PersonalTierSelection`, mặc định `null`.
- Có nút “Bỏ chọn” khi đang chọn.
- `ResultCard`/`ScoreBreakdown`/`PersonalTasteSlider` phải xử lý `null` ở mọi chỗ:
  - `RARITIES[personalTier]` → guard.
  - `TIER_ORDER.indexOf(personalTier)` → guard.
  - Copy “Gu cá nhân: Chưa chọn”.
  - Badge “GU BẠN 25%” → “CHƯA CHỌN” khi null.
  - `nextTier` advice không so sánh `null < 80`.

> Đây là thay đổi duy nhất vào business logic trong đợt rebuild; mọi phần scoring khác giữ nguyên.

---

## 12. Risk register

| Rủi ro | Mức | Giảm thiểu |
|---|---|---|
| Mất thay đổi chưa commit | **Cao** | Checkpoint branch/tag trước Phase 1 |
| Regression scoring/API | Cao | UI-only; không sửa lib/API; giữ 36 test |
| Route/CSS cũ vỡ | Cao | `/preview` + giữ CSS cũ đến khi swap; xóa sau |
| Roblox API rate limit/flaky | Cao | Fixture mock dev; retry; cache; timeout |
| Score 10 vs 100 gây lệch | Trung bình | Một hàm `formatScore` duy nhất; test |
| Default personal tier trừ điểm oan | **Đã xử lý** | `null` = “Chưa chọn” → 100% AI; test riêng |
| Nullable `personalTier` làm vỡ UI cũ | Trung bình | Cập nhật đồng bộ `ResultCard`, `ScoreBreakdown`, `PersonalTasteSlider`, `page.tsx`; typecheck + test |
| Font load/FOUT | Trung bình | `next/font`, `display: swap`, preload |
| Export ảnh CORS | Trung bình | Phase 2; proxy/next-og; MVP text share |
| ResultCard quá lớn | Trung bình | Chia panel + accordion + lazy |
| Motion gây khó chịu | Trung bình | Reduced-motion; không infinite |
| Tailwind dynamic class bị purge | Trung bình | Static class map, không nối chuỗi |
| Hydration mismatch | Thấp | Sound mounted guard; năm footer server |
| Mobile tràn do stamp/sticker | Trung bình | Test 320px; wrapper overflow |
| Copy “AI” sai sự thật | Trung bình | Đổi thành “hệ thống chấm điểm”; disclaimer |
| SEO/OG còn theme tối | Thấp | Cập nhật metadata/OG |
| Unused imports/components | Thấp | Cleanup cuối, grep |

---

## 13. Definition of Done

- [ ] `/` là landing mới, không có input username; CTA rõ ràng sang `/scan`.
- [ ] `/scan` có input, chạy đủ flow và states.
- [ ] Gu cá nhân mặc định “Chưa chọn”; khi null điểm = 100% hệ thống; khi chọn mới áp dụng 75/25.
- [ ] UI hiển thị “Chưa chọn” ở mọi nơi liên quan, không hiện `0/100` gây hiểu nhầm.
- [ ] Toàn bộ UI dùng tokens mới; không còn neon/glass.
- [ ] Không còn component/CSS cũ chưa migrate.
- [ ] Build, typecheck, test pass.
- [ ] Responsive 320–1440 không tràn.
- [ ] Keyboard + screen reader + reduced motion pass.
- [ ] Contrast AA pass; không chữ trắng trên cam.
- [ ] Copy không gọi “AI” sai; có disclaimer Roblox.
- [ ] Performance budgets đạt.
- [ ] `REBUILD_PLAN.md`/`DESIGN.md` được cập nhật thành spec v2 bàn giao.

---

## Phụ lục A — Copy deck nháp

| Vị trí | Copy |
|---|---|
| Landing eyebrow | `ROBLOX AVATAR ROAST & RATE` |
| Landing H1 | `AVATAR CỦA BẠN CÓ DRIP KHÔNG?` |
| Landing sub | `Nhập username Roblox. Nhận điểm, con dấu verdict và một tràng roast (hoặc khen) trong vài giây.` |
| Landing CTA | `CHẤM AVATAR CỦA TÔI` |
| Landing CTA phụ | `XEM CÁCH HOẠT ĐỘNG` |
| Ticker | `ROAST • RATE • RANK • REPEAT` |
| How it works H2 | `3 BƯỚC ĐỂ BIẾT MÌNH CÓ DRIP` |
| Step 1 | `NHẬP USERNAME` — `Chỉ cần username công khai. Không đăng nhập.` |
| Step 2 | `SOI AVATAR` — `Đối chiếu 270 aesthetics, phụ kiện và giá catalog.` |
| Step 3 | `NHẬN VERDICT` — `Điểm, con dấu và lời nhận xét.` |
| Rarity H2 | `6 BẬC DRIP` |
| FAQ H2 | `CÂU HỎI THƯỜNG GẶP` |
| Final CTA H2 | `SẴN SÀNG BỊ ROAST?` |
| Scan H1 | `NHẬP USERNAME ROBLOX` |
| Scan sub | `Tôi sẽ soi avatar của bạn, chấm điểm và nói thật.` |
| Placeholder | `ví dụ: builderman` |
| Scan button | `QUÉT & CHẤM ĐIỂM` |
| Privacy | `Chỉ đọc dữ liệu công khai từ Roblox API. Không lưu mật khẩu.` |
| Found CTA | `ROAST & CHẤM ĐIỂM` |
| Secondary | `ĐỔI USERNAME` |
| Personal taste label | `CHỌN GU CỦA BẠN (KHÔNG BẮT BUỘC)` |
| Personal taste empty | `CHƯA CHỌN — ĐIỂM TÍNH 100% TỪ HỆ THỐNG` |
| Personal taste clear | `BỎ CHỌN` / `ĐỂ HỆ THỐNG CHẤM` |
| Result personal empty | `Gu cá nhân: Chưa chọn` |
| Scanning | `ĐANG SOI AVATAR...` |
| Reveal CTA | `XEM CHI TIẾT` |
| Action rescan | `ROAST LẠI` |
| Action copy | `COPY KẾT QUẢ` |
| Action share | `CHIA SẺ` |
| Action Roblox | `MỞ ROBLOX ↗` |
| New search | `QUÉT USERNAME KHÁC` |
| Error 404 | `Không tìm thấy username này. Kiểm tra chính tả nhé.` |
| Error 429 | `Roblox đang giới hạn truy cập. Thử lại sau 1–2 phút.` |
| Error network | `Không kết nối được Roblox. Thử lại nhé.` |
| Data warning | `Kết quả dựa trên dữ liệu chưa đầy đủ. Điểm có thể thấp hơn thực tế.` |
| Disclaimer | `Chỉ mang tính giải trí. Không liên kết với Roblox Corporation.` |

**Stamp vocabulary:**

`NEEDS WORK`, `NOT BAD`, `CERTIFIED DRIP`, `MAIN CHARACTER`, `HALL OF FAME`, `AVATAR GOD`, `COSPLAY CONFIRMED`, `MEME LORD`, `BUDGET FIT`, `DATA CHECK`.

**Tone guardrails:**

- Roast **outfit**, không roast ngoại hình/người thật.
- Không slur, không body shaming, không tấn công cá nhân.
- Với avatar mặc định/ít item: đùa nhẹ, không miệt thị.
- Không hứa hẹn “AI chính xác 100%”; ghi rõ rule-based + dữ liệu công khai.
- Nếu người dùng là trẻ vị thành niên (Roblox), giữ ngôn ngữ lành mạnh.

---

## Phụ lục B — Component state matrix

| Component | Default | Hover | Active | Focus | Disabled | Loading | Error | Empty |
|---|---|---|---|---|---|---|---|---|
| Button | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | — |
| Input | ✓ | — | — | ✓ | ✓ | ✓ | ✓ | ✓ |
| Card | ✓ | optional | optional | — | — | — | — | — |
| Badge | ✓ | — | — | — | — | — | — | — |
| Stamp | ✓ | — | — | — | — | — | — | — |
| Bubble | ✓ | — | — | — | — | — | — | ✓ |
| AvatarFrame | ✓ | — | — | — | — | ✓ | ✓ | ✓ |
| ScoreDisplay | ✓ | — | — | — | — | ✓ | — | ✓ |
| ProgressBar | ✓ | — | — | — | — | — | — | ✓ |
| Alert | ✓ | — | — | — | — | — | ✓ | — |
| ActionBar | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | — |

---

## Phụ lục C — Tailwind token mapping (gợi ý)

```ts
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      bg: "var(--c-bg)",
      surface: "var(--c-surface)",
      "surface-2": "var(--c-surface-2)",
      ink: "var(--c-ink)",
      "ink-2": "var(--c-ink-2)",
      muted: "var(--c-muted)",
      line: "var(--c-line)",
      "line-soft": "var(--c-line-soft)",
      lemon: "var(--c-lemon)",
      coral: "var(--c-coral)",
      mint: "var(--c-mint)",
      violet: "var(--c-violet)",
      cyan: "var(--c-cyan)",
      danger: "var(--c-danger)",
      warning: "var(--c-warning)",
      success: "var(--c-success)",
    },
    fontFamily: {
      display: ["var(--font-display)", "sans-serif"],
      body: ["var(--font-body)", "sans-serif"],
      mono: ["var(--font-mono)", "monospace"],
    },
    boxShadow: {
      1: "var(--shadow-1)",
      2: "var(--shadow-2)",
      3: "var(--shadow-3)",
      4: "var(--shadow-4)",
    },
    borderRadius: {
      sm: "var(--r-sm)",
      md: "var(--r-md)",
      lg: "var(--r-lg)",
    },
  },
}
```

> Không dùng class động kiểu `bg-${tier}`. Dùng map tĩnh trong `tierTheme.ts`:
>
> ```ts
> export const TIER_CLASS: Record<RarityTier, string> = {
>   COMMON: "bg-surface-2 text-ink",
>   UNCOMMON: "bg-mint text-ink",
>   RARE: "bg-cyan text-ink",
>   EPIC: "bg-violet text-ink",
>   LEGENDARY: "bg-lemon text-ink",
>   MYTHICAL: "bg-coral text-ink",
> };
> ```

---

## Phụ lục D — Checklist review `DESIGN.md` trước khi chốt spec v2

- [ ] Mỗi token chỉ còn một giá trị.
- [ ] Có bảng contrast cho mọi cặp text/nền accent.
- [ ] Có type scale + font pairing đã kiểm tra tiếng Việt.
- [ ] Có spacing/container/breakpoint.
- [ ] Có state matrix cho 5 component cốt lõi.
- [ ] Có page IA landing + scan.
- [ ] Có score/stamp/bubble mapping.
- [ ] Có error/loading/empty.
- [ ] Có responsive rules.
- [ ] Có a11y rules.
- [ ] Có asset handling.
- [ ] Có copy deck + tone guardrails.
- [ ] Có acceptance criteria + QA checklist.

---

**Kết luận:** `DESIGN.md` hiện tại là **brief tốt, spec chưa đủ**. Sau khi áp dụng Mục 4–6 và chốt Mục 11, spec sẽ đủ để implement mà không phải đoán. Kế hoạch rebuild giữ business logic bất động, xây UI mới trên branch riêng, và chỉ swap route khi QA xong — rủi ro phá codebase được giới hạn ở lớp trình bày.
