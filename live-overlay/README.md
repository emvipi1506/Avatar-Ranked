# Live Overlay — Avatar Ranked

Overlay bảng xếp hạng **tách riêng khỏi website**, dùng để chiếu lên livestream (OBS).
Nó không phải một trang trong web: chạy bằng một static server rất nhẹ, đọc dữ liệu
từ API live của website theo thời gian thực (mặc định **mỗi 1 giây**).

## Chạy nhanh

Từ thư mục `avatar-ranked`:

```powershell
npm run live
```

Hoặc mở trực tiếp `live-overlay/start.bat` (Windows).

Sau đó mở:

- **Preview có nền tối:** http://localhost:4173/?bg=solid
- **Bản dùng cho OBS (nền trong suốt):** http://localhost:4173/

## Thêm vào OBS

1. Trong OBS, bấm **+ → Browser**.
2. Đặt tên, ví dụ `Avatar Ranked Live`.
3. URL: `http://localhost:4173/`
4. Width: `1920`, Height: `1080` (hoặc đúng độ phân giải canvas của bạn).
5. Bật **Shutdown source when not visible**.
6. Bấm **Refresh cache of current page** sau khi sửa code/cấu hình.

Overlay tự cập nhật, tự xoay trang, tự highlight avatar vừa được quét. Không cần
thao tác gì trên OBS khi có người quét mới.

## Query string

| Tham số | Mặc định | Ý nghĩa |
| --- | --- | --- |
| `api` | `https://avatar-ranked.vercel.app` | Gốc API của website. Dùng `http://localhost:3000` khi test local. |
| `poll` | `1000` | Kiểm tra dữ liệu mỗi bao nhiêu ms (500–30000). |
| `rotate` | `10000` | Thời gian giữ mỗi trang (3000–120000 ms). |
| `highlight` | `8000` | Thời gian giữ highlight entry mới (1000–60000 ms). |
| `size` | `6` | Số hàng mỗi trang (3–12). |
| `align` | `left` | Vị trí panel: `left`, `center`, `right`. |
| `bg` | trong suốt | `solid` để có nền tối đầy đủ (dùng khi preview). |

Ví dụ:

```
http://localhost:4173/?api=http://localhost:3000&align=right&bg=solid
```

## Cách lấy dữ liệu

1. Người dùng quét avatar trên website.
2. Website gửi kết quả lên `POST /api/live/board`.
3. Server lưu bảng live (Upstash Redis trên production, file JSON khi chạy local).
4. Overlay gọi `GET /api/live/board` mỗi giây và cập nhật ngay khi có entry mới.

Entry của tài khoản chủ web (`UncIe_Rice`) luôn hiện MYTHICAL khi quét nhưng bị server loại khỏi bảng live, nên overlay không bao giờ hiển thị tên này.

## Lưu ý production

- API `GET /api/live/board` đã mở CORS để overlay tách riêng đọc được. `POST`/`DELETE`
  vẫn chỉ nhận request cùng origin.
- Trên Vercel, bảng live cần **Upstash Redis** đã kết nối và redeploy. Nếu chưa có,
  API trả `500` và overlay sẽ hiện trạng thái **Offline**.
- Khi test local, chạy website ở `localhost:3000` rồi dùng
  `?api=http://localhost:3000`.

## Tùy chỉnh

Sửa `config.js` để đổi API mặc định, tốc độ poll, thời gian xoay trang, số hàng...
Query string luôn được ưu tiên hơn `config.js`.

Giao diện nằm trong `overlay.css`; logic nằm trong `overlay.js`. Không cần build.
