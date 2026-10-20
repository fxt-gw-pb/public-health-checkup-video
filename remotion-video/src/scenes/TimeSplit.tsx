import type React from "react";
import {
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Video } from "@remotion/media";
import { staticFile } from "remotion";
import { GoCheckHalf, NoCheckHalf } from "./TimeSplitHalves";

// R10 时间账分屏：左"去查"（SEG11），右"不查"（SEG12），中间一条黄铜色横梁竖过来当分隔。
// 左边时钟 8:00 → 11:30 跟着快进；右边年份一年一年往上翻。两半默认用 Seedance 的 SEG11/SEG12（1.25 倍速裁中间竖条）；TimeSplitHalves.tsx 是静帧动画备用版。
const Half = ({
  side,
  children,
}: {
  readonly side: "left" | "right";
  readonly children?: React.ReactNode;
}) => (
  <div
    style={{
      position: "absolute",
      top: 0,
      bottom: 0,
      width: "50%",
      left: side === "left" ? 0 : "50%",
      overflow: "hidden",
      backgroundColor: side === "left" ? "#DCEBF7" : "#D9D9D6",
    }}
  >
    {children}
  </div>
);

const Tag = ({
  text,
  bg,
  side,
}: {
  readonly text: string;
  readonly bg: string;
  readonly side: "left" | "right";
}) => (
  <div
    style={{
      position: "absolute",
      top: 90,
      left: side === "left" ? 110 : 1070,
      padding: "8px 36px",
      backgroundColor: bg,
      border: "5px solid #3B2A20",
      borderRadius: 16,
      fontFamily: "'ZCOOL KuaiLe'",
      fontSize: 72,
      color: "#FFFFFF",
    }}
  >
    {text}
  </div>
);

const TimeSplitInner = ({
  variant,
}: {
  readonly variant: "seedance" | "remotion";
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  // 8:00 → 11:30，共 210 分钟，在前 8 秒走完
  const minutes = Math.round(
    interpolate(frame, [0, 8 * fps], [0, 210], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const clock = `${8 + Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}`;
  const year =
    2026 +
    Math.floor(
      interpolate(frame, [0, 10 * fps], [0, 5], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }),
    );

  return (
    <>
      <Half side="left">
        {variant === "seedance" ? (
          <Video
            name="SEG11 去查"
            src={staticFile("seedance/SEG11.mp4")}
            playbackRate={1.25}
            volume={0.4}
            style={{
              position: "absolute",
              top: 0,
              left: -480,
              width: 1920,
              height: 1080,
            }}
          />
        ) : (
          <GoCheckHalf />
        )}
      </Half>
      <Half side="right">
        {variant === "seedance" ? (
          <Video
            name="SEG12 不查"
            src={staticFile("seedance/SEG12.mp4")}
            playbackRate={1.25}
            volume={0.4}
            style={{
              position: "absolute",
              top: 0,
              left: -480,
              width: 1920,
              height: 1080,
            }}
          />
        ) : (
          <NoCheckHalf />
        )}
      </Half>
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 960 - 14,
          width: 28,
          backgroundColor: "#C08A3E",
          borderLeft: "5px solid #3B2A20",
          borderRight: "5px solid #3B2A20",
        }}
      />
      <Tag text="去查" bg="#3E8FD1" side="left" />
      <Tag text="不查" bg="#7A7A76" side="right" />
      <div
        style={{
          position: "absolute",
          top: 90,
          left: 640,
          fontFamily: "'Noto Sans SC'",
          fontWeight: 900,
          fontSize: 72,
          color: "#2B2420",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {clock}
      </div>
      <div
        style={{
          position: "absolute",
          top: 90,
          left: 1560,
          fontFamily: "'Noto Sans SC'",
          fontWeight: 900,
          fontSize: 72,
          color: "#2B2420",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {year}
      </div>
      <Interactive.Div
        name="一个上午"
        style={{
          position: "absolute",
          left: 250,
          width: 460,
          bottom: 90,
          padding: "10px 0px",
          textAlign: "center",
          fontFamily: "'ZCOOL KuaiLe'",
          fontSize: 96,
          color: "#FFFFFF",
          backgroundColor: "#3E8FD1",
          border: "6px solid #3B2A20",
          borderRadius: 24,
          opacity: interpolate(frame, [8 * fps, 8 * fps + 6], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          scale: interpolate(frame, [8 * fps, 8 * fps + 10], [0.5, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.spring({ damping: 10 }),
          }),
        }}
      >
        一个上午
      </Interactive.Div>
      <div
        style={{
          position: "absolute",
          left: 960,
          right: 0,
          top: 0,
          bottom: 0,
          backgroundColor: "#F4E9D8",
          opacity: interpolate(
            frame,
            [durationInFrames - 18, durationInFrames],
            [0, 0.85],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          ),
        }}
      />
    </>
  );
};

export const TimeSplit = Interactive.create({
  Component: TimeSplitInner,
  layout: "absolute-fill",
  schema: {
    variant: {
      type: "enum",
      default: "seedance",
      description: "两半用哪个版本",
      variants: { seedance: {}, remotion: {} },
    },
  },
});
