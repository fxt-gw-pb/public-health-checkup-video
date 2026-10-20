import type React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Bead } from "./Bead";
import { bob } from "./motion";

// 账簿内页：暖米黄纸面 + 淡红竖格横线 + 左侧双红线。所有字卡共用这一张底。
// 为了不"死"：一道很淡的暖光慢慢扫过，四角漂着几颗算珠。纸面本身不动，避免闪烁感。
const FLOATERS = [
  { x: 60, y: 120, w: 70, phase: 0, rot: -18 },
  { x: 1790, y: 90, w: 90, phase: 17, rot: 14 },
  { x: 1740, y: 900, w: 80, phase: 31, rot: -10 },
  { x: 230, y: 960, w: 60, phase: 9, rot: 22 },
];

export const Paper: React.FC<{
  readonly children?: React.ReactNode;
  readonly accent?: string;
}> = ({ children, accent = "#4A2C1A" }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#F4E9D8",
        backgroundImage:
          "repeating-linear-gradient(0deg, rgba(217,68,58,0.14) 0px, rgba(217,68,58,0.14) 2px, transparent 2px, transparent 72px), repeating-linear-gradient(90deg, rgba(217,68,58,0.10) 0px, rgba(217,68,58,0.10) 2px, transparent 2px, transparent 240px)",
        boxShadow: "inset 0 0 160px rgba(107,63,34,0.28)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 150,
          width: 14,
          borderLeft: "3px solid rgba(217,68,58,0.45)",
          borderRight: "3px solid rgba(217,68,58,0.45)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: -200,
          bottom: -200,
          width: 700,
          background:
            "linear-gradient(90deg, rgba(255,246,220,0) 0%, rgba(255,246,220,0.45) 50%, rgba(255,246,220,0) 100%)",
          rotate: "12deg",
          translate: `${interpolate(frame, [0, 150], [-900, 2300], { extrapolateRight: "extend" })}px 0px`,
        }}
      />
      {FLOATERS.map((f, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: f.x - f.w / 2,
            top: f.y,
            rotate: `${f.rot + bob(frame, f.phase, 6, 70)}deg`,
            translate: `0px ${bob(frame, f.phase, 10, 56)}px`,
            opacity: 0.55,
          }}
        >
          <Bead width={f.w} fill={i % 2 ? accent : "#4A2C1A"} />
        </div>
      ))}
      {children}
    </AbsoluteFill>
  );
};
