"use client";

import { motion } from "framer-motion";
import { UserCheck, ScanLine, Trophy, ArrowRight } from "lucide-react";
import { fadeUp, stagger } from "@/lib/motion";

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Nhập Roblox Username",
      description:
        "Nhập tên người dùng của bất kỳ tài khoản công khai nào. Hệ thống gọi Roblox Web API để tải Avatar Thumbnail và thông tin trang phục chính xác nhất.",
      icon: <UserCheck className="h-6 w-6 text-[#46C8FF]" />,
      badge: "ROBLOX API",
    },
    {
      number: "02",
      title: "Kích Hoạt AI Scanner",
      description:
        "Trải nghiệm chuỗi quét laser đa chiều, hologram và phân tích style gồm 4 giai đoạn chuẩn phong cách gacha game viễn tưởng tương lai.",
      icon: <ScanLine className="h-6 w-6 text-[#A855F7]" />,
      badge: "AI SCAN MATRIX",
    },
    {
      number: "03",
      title: "Rarity Reveal & Chấm Điểm",
      description:
        "Mở khóa 1 trong 6 cấp bậc độ hiếm từ COMMON đến MYTHICAL, nhận bảng điểm 3 tiêu chí (Uniqueness, Value, Humor) và chia sẻ thành tích.",
      icon: <Trophy className="h-6 w-6 text-amber-400" />,
      badge: "GACHA RANKING",
    },
  ];

  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-title"
      className="relative mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6 sm:py-24"
    >
      <div className="mx-auto max-w-2xl text-center">
        <span className="font-mono text-xs uppercase tracking-widest text-[#46C8FF]">
          THREE-STEP WORKFLOW
        </span>
        <h2
          id="how-it-works-title"
          className="mt-2 font-sans text-3xl font-black uppercase tracking-tight text-white sm:text-4xl"
        >
          QUY TRÌNH HOẠT ĐỘNG
        </h2>
        <p className="mt-3 text-sm text-slate-400 sm:text-base">
          Đơn giản, tốc độ và an toàn tuyệt đối. Khám phá độ hiếm của avatar chỉ trong vài giây.
        </p>
      </div>

      <motion.div
        variants={stagger(0.12)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="mt-12 grid gap-6 sm:grid-cols-3"
      >
        {steps.map((step, idx) => (
          <motion.div
            key={step.number}
            variants={fadeUp}
            whileHover={{ y: -4 }}
            className="glass-card group relative overflow-hidden rounded-3xl p-6 sm:p-8"
          >
            {/* Top Indicator */}
            <div className="flex items-center justify-between">
              <span className="font-mono text-3xl font-black text-white/20 transition-colors duration-300 group-hover:text-[#46C8FF]/50">
                {step.number}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 font-mono text-[10px] text-slate-400">
                {step.badge}
              </span>
            </div>

            {/* Icon Box */}
            <div className="mt-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[#080A12] shadow-inner transition-transform duration-300 group-hover:scale-110">
              {step.icon}
            </div>

            {/* Content */}
            <h3 className="mt-5 font-sans text-lg font-black text-white">
              {step.title}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-400 sm:text-sm">
              {step.description}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
