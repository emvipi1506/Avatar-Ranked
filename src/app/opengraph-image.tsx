import { ImageResponse } from "next/og";

export const alt = "Avatar Ranked — Roast, rate và xếp hạng avatar Roblox";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TIERS = ["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY", "MYTHICAL"];

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#FFFDF5",
          color: "#111111",
          padding: "64px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "96px",
              height: "96px",
              backgroundColor: "#FFE600",
              border: "6px solid #111111",
              borderRadius: "16px",
              fontSize: "38px",
              fontWeight: 800,
              boxShadow: "8px 8px 0 #111111",
            }}
          >
            AR
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "34px", fontWeight: 800, letterSpacing: "-0.02em" }}>
              AVATAR RANKED
            </div>
            <div style={{ fontSize: "18px", letterSpacing: "0.18em", color: "#6B675A" }}>
              ROAST • RATE • RANK
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "22px", maxWidth: "980px" }}>
          <div
            style={{
              fontSize: "86px",
              fontWeight: 800,
              lineHeight: 0.95,
              letterSpacing: "-0.03em",
            }}
          >
            AVATAR CỦA BẠN CÓ DRIP KHÔNG?
          </div>
          <div style={{ fontSize: "30px", color: "#3D3B33" }}>
            Chấm avatar Roblox /10 · verdict · roast trong vài giây
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              backgroundColor: "#FF6B4A",
              border: "4px solid #111111",
              boxShadow: "6px 6px 0 #111111",
              padding: "16px 24px",
              fontSize: "26px",
              fontWeight: 800,
            }}
          >
            CHẤM AVATAR CỦA TÔI
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            {TIERS.map((tier) => (
              <div
                key={tier}
                style={{
                  display: "flex",
                  border: "3px solid #111111",
                  backgroundColor: "#FFFFFF",
                  padding: "8px 10px",
                  fontSize: "14px",
                  fontWeight: 700,
                }}
              >
                {tier}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
