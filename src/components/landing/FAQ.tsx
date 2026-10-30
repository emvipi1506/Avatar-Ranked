import { Plus } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";

const FAQS = [
  {
    q: "Có cần đăng nhập Roblox không?",
    a: "Không. Avatar Ranked chỉ đọc dữ liệu công khai từ Roblox API: profile, avatar, thumbnail và catalog. Bạn không cần nhập mật khẩu, không cần cấp quyền tài khoản.",
  },
  {
    q: "Điểm được tính như thế nào?",
    a: "Hệ thống chấm 4 tiêu chí: chỉn chu & hài hòa (35%), độc lạ & sáng tạo (30%), hài hước & meme (25%), giá trị catalog (10%). Khi bạn chưa chọn gu, điểm tổng = 100% điểm hệ thống. Khi chọn gu, điểm tổng = 75% hệ thống + 25% gu của bạn.",
  },
  {
    q: "Vì sao mặc định là “Chưa chọn”?",
    a: "Vì chúng tôi không muốn tự gán gu cho bạn. “Chưa chọn” nghĩa là điểm tổng không bị kéo xuống bởi một bậc mặc định. Bạn có thể chọn một trong 6 bậc bất cứ lúc nào, kể cả sau khi đã có kết quả.",
  },
  {
    q: "Kết quả có chính xác tuyệt đối không?",
    a: "Không. Đây là hệ thống rule-based dùng metadata vật phẩm, tên item và bảng màu pixel. Catalog có thể thiếu giá, một số item limited hoặc off-sale không được quy đổi. Kết quả mang tính giải trí, không phải đánh giá chính thức từ Roblox.",
  },
  {
    q: "Avatar riêng tư hoặc profile bị khóa thì sao?",
    a: "Hệ thống chỉ đọc được dữ liệu công khai. Nếu profile hoặc avatar không truy cập được, bạn sẽ thấy thông báo lỗi và có thể thử lại. Ảnh thumbnail lỗi sẽ được thay bằng avatar minh họa; điểm vẫn được tính nếu dữ liệu avatar còn đủ.",
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="nb-section border-b border-white/5 bg-transparent">
      <div className="nb-container">
        <SectionHeading
          align="center"
          eyebrow="04 · FAQ"
          title="Hỏi nhanh. Đáp gọn."
          description="Những điều cần biết trước khi để hệ thống soi avatar của bạn."
        />

        <div className="mx-auto mt-10 max-w-3xl divide-y divide-white/[0.07] overflow-hidden rounded-2xl border border-white/10 bg-[rgba(13,18,34,0.72)] shadow-[0_18px_48px_rgba(0,0,0,0.4)] backdrop-blur-xl">
          {FAQS.map((item, index) => (
            <details key={item.q} open={index === 0} className="group">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-4 py-4 transition-colors hover:bg-white/[0.03] sm:px-5 [&::-webkit-details-marker]:hidden">
                <span className="font-body text-sm font-bold leading-[1.5] text-ink sm:text-base">
                  {item.q}
                </span>
                <Plus
                  className="mt-0.5 h-5 w-5 shrink-0 text-cyan transition-transform duration-200 group-open:rotate-45"
                  aria-hidden
                />
              </summary>
              <p className="px-4 pb-4 text-sm leading-[1.65] text-ink-2 sm:px-5">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
