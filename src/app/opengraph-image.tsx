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
            "radial-gradient(circle at 70% 20%, #0e2a38 0%, #050507 55%)",
          color: "#C8D3DC",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 26,
            letterSpacing: 8,
            color: "#7DD3FC",
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
              color: "#EAF2F8",
            }}
          >
            {SITE.name}
          </div>
          <div
            style={{
              fontSize: 34,
              color: "#7DD3FC",
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
            color: "#8593A0",
            fontFamily: "monospace",
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 999,
              background: "#22D3EE",
            }}
          />
          STATUS: OPEN TO WORK
        </div>
      </div>
    ),
    size
  );
}
