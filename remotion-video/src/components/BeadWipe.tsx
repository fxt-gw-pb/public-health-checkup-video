import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from "@remotion/transitions";
import type React from "react";
import { AbsoluteFill, Easing, interpolate, useVideoConfig } from "remotion";
import { Bead } from "./Bead";
import { SparkBurst } from "./motion";

// R04 算珠转场：一根竖着的算盘"档"（上 2 颗、下 5 颗珠）从左扫到右，
// 扫过的地方露出下一段画面；快到终点时下层 5 颗珠"啪"地推向横梁。
const COLUMN_WIDTH = 220;

const BeadWipeComponent: React.FC<
  TransitionPresentationComponentProps<Record<string, never>>
> = ({ children, presentationDirection, presentationProgress }) => {
  const { width, height } = useVideoConfig();
  if (presentationDirection === "exiting") {
    return <AbsoluteFill>{children}</AbsoluteFill>;
  }

  // 先快后慢地扫过；速度快的时候整根档往前倾一点
  const e = Easing.bezier(0.65, 0, 0.25, 1)(presentationProgress);
  const center = interpolate(e, [0, 1], [-COLUMN_WIDTH, width + COLUMN_WIDTH]);
  const speed = Math.abs(
    Easing.bezier(0.65, 0, 0.25, 1)(Math.min(1, presentationProgress + 0.02)) -
      e,
  );
  const tilt = Math.min(9, speed * 260);
  const revealed = Math.min(100, Math.max(0, (center / width) * 100));
  const push = interpolate(presentationProgress, [0.45, 0.72], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.8)),
  });
  const pushFrame = Math.round(presentationProgress * 24);
  const beamY = height * 0.3;

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: `inset(0 ${100 - revealed}% 0 0)` }}>
        {children}
      </AbsoluteFill>
      {/* 扫过的边缘一道柔和投影，让新旧画面的分界不生硬 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          height,
          left: center - 160,
          width: 160,
          background:
            "linear-gradient(90deg, rgba(43,36,32,0) 0%, rgba(43,36,32,0.28) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          height,
          width: COLUMN_WIDTH,
          left: center - COLUMN_WIDTH / 2,
          rotate: `${tilt}deg`,
          transformOrigin: "50% 30%",
        }}
      >
        {/* 档杆 */}
        <div
          style={{
            position: "absolute",
            left: COLUMN_WIDTH / 2 - 7,
            top: 0,
            bottom: 0,
            width: 14,
            backgroundColor: "#C08A3E",
            border: "3px solid #3B2A20",
          }}
        />
        {/* 横梁 */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: beamY - 22,
            height: 44,
            backgroundColor: "#6B3F22",
            border: "5px solid #3B2A20",
            borderRadius: 8,
          }}
        />
        {[0, 1].map((i) => (
          <Bead
            key={`up${i}`}
            width={COLUMN_WIDTH - 20}
            style={{ position: "absolute", left: 10, top: 40 + i * 112 }}
          />
        ))}
        {[0, 1, 2, 3, 4].map((i) => (
          <Bead
            key={`down${i}`}
            width={COLUMN_WIDTH - 20}
            style={{
              position: "absolute",
              left: 10,
              top: interpolate(
                push,
                [0, 1],
                [height - 140 - (4 - i) * 112, beamY + 32 + i * 112],
              ),
            }}
          />
        ))}
        <SparkBurst
          frame={pushFrame}
          at={17}
          x={COLUMN_WIDTH / 2}
          y={beamY + 40}
          size={110}
          color="#E0A526"
        />
      </div>
    </AbsoluteFill>
  );
};

export const beadWipe = (): TransitionPresentation<Record<string, never>> => ({
  component: BeadWipeComponent,
  props: {},
});
