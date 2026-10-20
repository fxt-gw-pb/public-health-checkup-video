import type React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

// 全片对白字幕：底部居中，思源黑体，白字 + 深褐描边（与风格圣经第 3 节一致）。
// 每条出现时轻轻弹一下，消失时淡出；时间单位是秒，相对所在片段的开头（见 src/captions.ts）。
type Cue = {
  readonly from: number;
  readonly to: number;
  readonly text: string;
};

export const Subtitles: React.FC<{ readonly cues: readonly Cue[] }> = ({
  cues,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const cue = cues.find((c) => t >= c.from && t < c.to);
  if (!cue) return null;
  const a = cue.from * fps;
  const b = Math.max(cue.to * fps, a + 8);
  const opacity = interpolate(frame, [a, a + 3, b - 3, b], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = interpolate(frame, [a, a + 6], [0.9, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(2)),
  });

  return (
    <div
      style={{
        position: "absolute",
        left: 160,
        right: 160,
        bottom: 64,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: 1500,
          textAlign: "center",
          textWrap: "balance",
          fontFamily: "'Noto Sans SC'",
          fontWeight: 900,
          fontSize: 54,
          lineHeight: 1.3,
          color: "#FFFFFF",
          WebkitTextStroke: "10px #2B2420",
          paintOrder: "stroke fill",
          textShadow: "0 4px 10px rgba(0,0,0,0.35)",
          opacity,
          scale,
        }}
      >
        {cue.text}
      </div>
    </div>
  );
};
