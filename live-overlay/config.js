/**
 * Cấu hình mặc định cho overlay. Có thể ghi đè bằng query string:
 *   ?api=http://localhost:3000   → đọc bảng live từ server local
 *   ?poll=1000                   → tần suất kiểm tra (ms)
 *   ?rotate=10000                → thời gian mỗi trang (ms)
 *   ?highlight=8000              → thời gian giữ highlight entry mới (ms)
 *   ?size=6                      → số hàng mỗi trang
 *   ?align=left|center|right     → vị trí panel trên khung hình
 *   ?bg=solid                    → nền tối đầy đủ (mặc định trong suốt cho OBS)
 */
window.LIVE_OVERLAY_CONFIG = {
  apiBase: "https://avatar-ranked.vercel.app",
  pollMs: 1000,
  rotateMs: 10000,
  highlightMs: 8000,
  pageSize: 6,
  align: "left",
};
