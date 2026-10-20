import type React from "react";
import { Easing, interpolate } from "remotion";

// 全片共用的动效手感：像算珠落位——快、脆、带一点回弹。
// 所有字卡都用这里的函数，保证节奏一致。

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// 弹入：从 0 放大到 1，略微冲过头再回落
export const popScale = (frame: number, start: number, dur = 12) =>
  interpolate(frame, [start, start + dur], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.back(2.2)),
  });

export const fadeIn = (frame: number, start: number, dur = 6) =>
  interpolate(frame, [start, start + dur], [0, 1], clamp);

// 落地挤压：落下的瞬间压扁、横向撑开，然后弹回原样（返回 "sx sy"）
export const squash = (frame: number, land: number, amount = 0.28) => {
  const t = frame - land;
  if (t < 0 || t > 12) return "1 1";
  const k = Math.exp(-t / 3.2) * Math.cos(t * 0.9);
  return `${1 + amount * k} ${1 - amount * k}`;
};

// 从上方落下（带重力加速），落地后由 squash 接手
export const dropY = (
  frame: number,
  start: number,
  land: number,
  from = -520,
) =>
  interpolate(frame, [start, land], [from, 0], {
    ...clamp,
    easing: Easing.in(Easing.quad),
  });

// 待机漂浮：让画面里的元素一直有一点呼吸感，不会"死"在那里
export const bob = (frame: number, phase = 0, amp = 6, period = 48) =>
  Math.sin(((frame + phase) / period) * Math.PI * 2) * amp;

// 落地时迸出的一圈短线（漫画里的"噼啪"）
export const SparkBurst: React.FC<{
  readonly frame: number;
  readonly at: number;
  readonly x: number;
  readonly y: number;
  readonly color?: string;
  readonly size?: number;
  readonly rays?: number;
}> = ({ frame, at, x, y, color = "#C08A3E", size = 70, rays = 8 }) => {
  const t = frame - at;
  if (t < 0 || t > 10) return null;
  const p = interpolate(t, [0, 10], [0, 1], {
    easing: Easing.out(Easing.quad),
  });
  return (
    <svg
      width={size * 3}
      height={size * 3}
      viewBox={`${-size * 1.5} ${-size * 1.5} ${size * 3} ${size * 3}`}
      style={{
        position: "absolute",
        left: x - size * 1.5,
        top: y - size * 1.5,
        pointerEvents: "none",
      }}
    >
      {Array.from({ length: rays }, (_, i) => {
        const a = (i / rays) * Math.PI * 2 + 0.3;
        const r0 = size * (0.35 + 0.6 * p);
        const r1 = r0 + size * 0.38 * (1 - p);
        return (
          <line
            key={i}
            x1={Math.cos(a) * r0}
            y1={Math.sin(a) * r0}
            x2={Math.cos(a) * r1}
            y2={Math.sin(a) * r1}
            stroke={color}
            strokeWidth={7 * (1 - p) + 1}
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
};

// 逐字弹出的标题
export const StaggerText: React.FC<{
  readonly text: string;
  readonly frame: number;
  readonly start: number;
  readonly step?: number;
  readonly style?: React.CSSProperties;
}> = ({ text, frame, start, step = 2, style }) => (
  <span style={{ display: "inline-flex", ...style }}>
    {[...text].map((ch, i) => {
      const s = start + i * step;
      return (
        <span
          key={i}
          style={{
            display: "inline-block",
            whiteSpace: "pre",
            opacity: fadeIn(frame, s, 3),
            translate: `0px ${interpolate(frame, [s, s + 9], [36, 0], { ...clamp, easing: Easing.out(Easing.back(2.5)) })}px`,
            rotate: `${interpolate(frame, [s, s + 9], [i % 2 ? 10 : -10, 0], clamp)}deg`,
          }}
        >
          {ch}
        </span>
      );
    })}
  </span>
);
