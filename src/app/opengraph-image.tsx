import { ImageResponse } from "next/og";
import { SITE } from "@/lib/content";

export const alt = `${SITE.name} — software engineer · devsecops · blockchain`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** On-brand dark OG card. Uses default fonts to stay build-portable. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background:
            "radial-gradient(circle at 70% 20%, #2a1a0c 0%, #0b0908 55%)",
          color: "#e8e1d9",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 26,
            letterSpacing: 8,
            color: "#f5b14c",
            fontFamily: "monospace",
          }}
        >
          {SITE.alias}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div
            style={{
              fontSize: 104,
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: -3,
              color: "#F7F1E8",
            }}
          >
            {SITE.name}
          </div>
          <div
            style={{
              fontSize: 34,
              color: "#f5b14c",
              fontFamily: "monospace",
            }}
          >
            software engineer · devsecops · blockchain
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 24,
            letterSpacing: 4,
            color: "#9A8C7C",
            fontFamily: "monospace",
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 999,
              background: "#ff7a45",
            }}
          />
          STATUS: OPEN TO WORK
        </div>
      </div>
    ),
    size
  );
}
