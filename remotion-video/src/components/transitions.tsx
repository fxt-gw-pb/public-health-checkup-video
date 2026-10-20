import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from "@remotion/transitions";
import type React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";

// 视频 ↔ 字卡之间的转场。全部用"纸"的逻辑：字卡像一页账簿翻上来盖住视频，离开时被掀走。

type P = TransitionPresentationComponentProps<Record<string, never>>;
const ease = Easing.bezier(0.22, 1, 0.36, 1);

// 字卡从下方翻上来，带一点旋转和投影；底下的视频轻微后退变暗
const PaperIn: React.FC<P> = ({
  children,
  presentationDirection,
  presentationProgress: p,
}) => {
  if (presentationDirection === "exiting") {
    return (
      <AbsoluteFill
        style={{
          scale: interpolate(p, [0, 1], [1, 0.94]),
          filter: `brightness(${interpolate(p, [0, 1], [1, 0.55])})`,
        }}
      >
        {children}
      </AbsoluteFill>
    );
  }
  const e = ease(p);
  return (
    <AbsoluteFill
      style={{
        translate: `0px ${interpolate(e, [0, 1], [1150, 0])}px`,
        rotate: `${interpolate(e, [0, 1], [7, 0])}deg`,
        transformOrigin: "50% 100%",
        boxShadow: "0 -30px 60px rgba(43,36,32,0.35)",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// 字卡被往上掀走，露出下一段视频（视频从略微放大处落定）
const PaperOut: React.FC<P> = ({
  children,
  presentationDirection,
  presentationProgress: p,
}) => {
  if (presentationDirection === "entering") {
    return (
      <AbsoluteFill style={{ scale: interpolate(ease(p), [0, 1], [1.08, 1]) }}>
        {children}
      </AbsoluteFill>
    );
  }
  const e = Easing.in(Easing.cubic)(p);
  return (
    <AbsoluteFill
      style={{
        translate: `${interpolate(e, [0, 1], [0, 260])}px ${interpolate(e, [0, 1], [0, -1250])}px`,
        rotate: `${interpolate(e, [0, 1], [0, -9])}deg`,
        transformOrigin: "0% 0%",
        boxShadow: "0 40px 70px rgba(43,36,32,0.4)",
        zIndex: 2,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// 镜头冲进画面：上一段放大并淡出，下一段从稍小处放大落定（算珠特写 → 账簿、账簿 → 账簿空间）
const ZoomThrough: React.FC<P> = ({
  children,
  presentationDirection,
  presentationProgress: p,
}) => {
  // 两段不重叠地交替：前半段旧画面冲近并被暖白光吞没，后半段新画面从光里落定，中间不会糊成一团
  if (presentationDirection === "exiting") {
    return (
      <AbsoluteFill
        style={{
          scale: interpolate(Easing.in(Easing.cubic)(p), [0, 1], [1, 2.6]),
        }}
      >
        {children}
        <AbsoluteFill
          style={{
            backgroundColor: "#FFF6E0",
            opacity: interpolate(p, [0.2, 0.5], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill
      style={{
        scale: interpolate(ease(p), [0, 1], [0.9, 1]),
        opacity: interpolate(p, [0.5, 0.51], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    >
      {children}
      <AbsoluteFill
        style={{
          backgroundColor: "#FFF6E0",
          opacity: interpolate(p, [0.5, 0.85], [1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />
    </AbsoluteFill>
  );
};

// 分屏左右两扇"门"：进场时两半从两边推进来，出场时两半向两边拉开
const half = (
  side: "left" | "right",
  offset: number,
  children: React.ReactNode,
) => (
  <AbsoluteFill
    style={{
      clipPath: side === "left" ? "inset(0 50% 0 0)" : "inset(0 0 0 50%)",
      translate: `${side === "left" ? -offset : offset}px 0px`,
    }}
  >
    {children}
  </AbsoluteFill>
);

const DoorsIn: React.FC<P> = ({
  children,
  presentationDirection,
  presentationProgress: p,
}) => {
  if (presentationDirection === "exiting")
    return <AbsoluteFill>{children}</AbsoluteFill>;
  const off = interpolate(Easing.out(Easing.back(1.1))(p), [0, 1], [980, 0]);
  return (
    <AbsoluteFill>
      {half("left", off, children)}
      {half("right", off, children)}
    </AbsoluteFill>
  );
};

const DoorsOut: React.FC<P> = ({
  children,
  presentationDirection,
  presentationProgress: p,
}) => {
  if (presentationDirection === "entering")
    return <AbsoluteFill>{children}</AbsoluteFill>;
  const off = interpolate(Easing.in(Easing.cubic)(p), [0, 1], [0, 980]);
  return (
    <AbsoluteFill style={{ zIndex: 2 }}>
      {half("left", off, children)}
      {half("right", off, children)}
    </AbsoluteFill>
  );
};

// 翻账页：旧画面像账簿的一页从右往左翻过去（右下角先掀起），折边是纸背+阴影，翻过去后露出下一页
const W = 1920;
const H = 1080;
const PageTurn: React.FC<P> = ({
  children,
  presentationDirection,
  presentationProgress: p,
}) => {
  if (presentationDirection === "entering")
    return <AbsoluteFill>{children}</AbsoluteFill>;
  const e = Easing.bezier(0.45, 0, 0.3, 1)(p);
  const fx = interpolate(e, [0, 1], [W + 260, -520]);
  const tilt = interpolate(e, [0, 1], [220, 60]);
  const top = fx + tilt;
  const bot = fx - tilt;
  // 翻起的那一片纸背：宽度先变大再变小，像纸被拉起又压平
  const flapW = Math.max(
    0,
    Math.min(W - fx, 420) * interpolate(e, [0, 0.5, 1], [0.6, 1, 0.4]),
  );
  return (
    <AbsoluteFill style={{ zIndex: 2 }}>
      <AbsoluteFill
        style={{
          clipPath: `polygon(0 0, ${top}px 0, ${bot}px ${H}px, 0 ${H}px)`,
        }}
      >
        {children}
      </AbsoluteFill>
      <svg
        width={W}
        height={H}
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
      >
        <defs>
          <linearGradient id="pageturn-back" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0" stopColor="#D9C9AE" />
            <stop offset="0.35" stopColor="#F4E9D8" />
            <stop offset="1" stopColor="#E8D9BF" />
          </linearGradient>
          <linearGradient id="pageturn-shadow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="rgba(43,36,32,0.45)" />
            <stop offset="1" stopColor="rgba(43,36,32,0)" />
          </linearGradient>
        </defs>
        {/* 折边投在下一页上的阴影 */}
        <polygon
          points={`${top},0 ${top + 140},0 ${bot + 140},${H} ${bot},${H}`}
          fill="url(#pageturn-shadow)"
        />
        {/* 翻起的纸背，带账簿横线 */}
        <polygon
          points={`${top},0 ${top - flapW},0 ${bot - flapW * 0.7},${H} ${bot},${H}`}
          fill="url(#pageturn-back)"
          stroke="#3B2A20"
          strokeWidth={5}
          strokeLinejoin="round"
        />
        {Array.from({ length: 14 }, (_, i) => {
          const y = 40 + i * 74;
          const t = y / H;
          const x1 = top + (bot - top) * t;
          const x0 = x1 - flapW * (1 - 0.3 * t);
          return (
            <line
              key={i}
              x1={x0 + 12}
              y1={y}
              x2={x1 - 12}
              y2={y}
              stroke="rgba(217,68,58,0.25)"
              strokeWidth={3}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

// 甩镜头：旧画面带着运动模糊向左甩出，新画面从右边甩进来，中间几道速度线
const WhipPan: React.FC<P> = ({
  children,
  presentationDirection,
  presentationProgress: p,
}) => {
  const e = Easing.inOut(Easing.cubic)(p);
  const blur = interpolate(p, [0, 0.5, 1], [0, 28, 0]);
  if (presentationDirection === "exiting") {
    return (
      <AbsoluteFill
        style={{
          translate: `${interpolate(e, [0, 1], [0, -480])}px 0px`,
          // 一边甩一边放大，保证横移时画面始终铺满、不露黑边
          scale: interpolate(e, [0, 1], [1, 1.6]),
          filter: `blur(${blur}px)`,
          opacity: interpolate(p, [0.45, 0.6], [1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {children}
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          translate: `${interpolate(e, [0, 1], [480, 0])}px 0px`,
          scale: interpolate(e, [0, 1], [1.6, 1]),
          filter: `blur(${blur}px)`,
          opacity: interpolate(p, [0.4, 0.55], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {children}
      </AbsoluteFill>
      <svg
        width={W}
        height={H}
        style={{
          position: "absolute",
          inset: 0,
          opacity: interpolate(p, [0.2, 0.5, 0.8], [0, 0.85, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {[180, 320, 470, 610, 760, 890].map((y, i) => (
          <line
            key={y}
            x1={interpolate(p, [0, 1], [W, -400]) + i * 90}
            y1={y}
            x2={interpolate(p, [0, 1], [W, -400]) + i * 90 + 520}
            y2={y}
            stroke="#FFF6E0"
            strokeWidth={10 - i}
            strokeLinecap="round"
          />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

const make = (
  component: React.FC<P>,
): TransitionPresentation<Record<string, never>> => ({ component, props: {} });
export const paperIn = () => make(PaperIn);
export const paperOut = () => make(PaperOut);
export const zoomThrough = () => make(ZoomThrough);
export const doorsIn = () => make(DoorsIn);
export const doorsOut = () => make(DoorsOut);
export const pageTurn = () => make(PageTurn);
export const whipPan = () => make(WhipPan);
