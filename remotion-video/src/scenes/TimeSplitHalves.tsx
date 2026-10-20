import type React from "react";
import {
  Easing,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// R10 时间账分屏的左右两半（代替原计划的 SEG11 / SEG12 视频，用首帧和抠图做静帧动画）。
// 每一半都是 960×1080。坐标都按原图（1672×941）测量，再按裁切比例换算。

const HALF_W = 960;
const HALF_H = 1080;

// 把原图里的一块 8:9 区域铺满半屏
const Crop: React.FC<{
  readonly src: string;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly imgW?: number;
  readonly zoom?: number;
  readonly style?: React.CSSProperties;
}> = ({ src, x, y, w, imgW = 1672, zoom = 1, style }) => {
  const s = HALF_W / w;
  return (
    <div
      style={{ position: "absolute", inset: 0, overflow: "hidden", ...style }}
    >
      <Img
        src={staticFile(src)}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: imgW * s,
          translate: `${-x * s}px ${-y * s}px`,
          scale: zoom,
          transformOrigin: `${(x + w / 2) * s}px ${(y + (w * HALF_H) / HALF_W / 2) * s}px`,
        }}
      />
    </div>
  );
};

const Badge: React.FC<{
  readonly frame: number;
  readonly at: number;
  readonly top: number;
  readonly text: string;
}> = ({ frame, at, top, text }) => (
  <div
    style={{
      position: "absolute",
      left: 70,
      top,
      padding: "10px 26px",
      backgroundColor: "#FFFFFF",
      border: "5px solid #3B2A20",
      borderRadius: 18,
      fontFamily: "'Noto Sans SC'",
      fontWeight: 900,
      fontSize: 44,
      color: "#2B2420",
      opacity: interpolate(frame, [at, at + 4], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }),
      scale: interpolate(frame, [at, at + 10], [0.4, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.spring({ damping: 10 }),
      }),
    }}
  >
    {text} <span style={{ color: "#3FA66A" }}>✓</span>
  </div>
);

// 左半："去查"——K11 体检中心大厅，挂钟 8:00 → 11:30 飞转，三项检查依次打勾
export const GoCheckHalf: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const minutes = interpolate(frame, [0, 8 * fps], [0, 210], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // K11 里挂钟圆心 (845,155)，裁切起点 x=427、宽 836 → 缩放 1.148
  const s = HALF_W / 836;
  const cx = (845 - 427) * s;
  const cy = 155 * s;

  return (
    <>
      <Crop
        src="ref/K11.jpg"
        x={427}
        y={0}
        w={836}
        zoom={interpolate(frame, [0, 12 * fps], [1, 1.06], {
          extrapolateRight: "clamp",
        })}
      />
      <svg
        width={HALF_W}
        height={HALF_H}
        style={{ position: "absolute", inset: 0 }}
      >
        <circle cx={cx} cy={cy} r={78 * s} fill="#EDD9C6" />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i * 30 * Math.PI) / 180;
          return (
            <line
              key={i}
              x1={cx + Math.sin(a) * 64 * s}
              y1={cy - Math.cos(a) * 64 * s}
              x2={cx + Math.sin(a) * 76 * s}
              y2={cy - Math.cos(a) * 76 * s}
              stroke="#2B2420"
              strokeWidth={6}
              strokeLinecap="round"
            />
          );
        })}
        <line
          x1={cx}
          y1={cy}
          x2={cx + Math.sin(((240 + minutes * 0.5) * Math.PI) / 180) * 42 * s}
          y2={cy - Math.cos(((240 + minutes * 0.5) * Math.PI) / 180) * 42 * s}
          stroke="#2B2420"
          strokeWidth={10}
          strokeLinecap="round"
        />
        <line
          x1={cx}
          y1={cy}
          x2={cx + Math.sin((minutes * 6 * Math.PI) / 180) * 70 * s}
          y2={cy - Math.cos((minutes * 6 * Math.PI) / 180) * 70 * s}
          stroke="#2B2420"
          strokeWidth={7}
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r={7} fill="#2B2420" />
      </svg>
      {/* 快进感：一道暖光从左往右反复扫过 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(100deg, rgba(255,240,200,0) 30%, rgba(255,240,200,0.28) 50%, rgba(255,240,200,0) 70%)",
          translate: `${interpolate(frame % (2 * fps), [0, 2 * fps], [-HALF_W, HALF_W])}px 0px`,
          opacity: interpolate(frame, [0, 8 * fps, 8 * fps + 6], [1, 1, 0], {
            extrapolateRight: "clamp",
          }),
        }}
      />
      <Badge frame={frame} at={1.5 * fps} top={560} text="抽血" />
      <Badge frame={frame} at={3.8 * fps} top={660} text="量血压" />
      <Badge frame={frame} at={6 * fps} top={760} text="做检查" />
      {/* 做完：阳光亮起来 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 50% 12%, rgba(255,236,170,0.35), rgba(255,236,170,0) 55%)",
          opacity: interpolate(frame, [8 * fps, 9 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />
    </>
  );
};

// 一页被撕下来飞走的日历纸
const TornPage: React.FC<{ readonly i: number }> = ({ i }) => {
  const frame = useCurrentFrame();
  const s = HALF_W / 836;
  return (
    <div
      style={{
        position: "absolute",
        left: (575 - 422) * s,
        top: 205 * s,
        width: 530 * s,
        height: 595 * s,
        backgroundColor: "#FBF4E9",
        border: "3px solid #3B2A20",
        borderRadius: 10,
        backgroundImage:
          "repeating-linear-gradient(0deg, rgba(190,170,150,0.15) 0px, rgba(190,170,150,0.15) 10px, transparent 18px, transparent 44px)",
        transformOrigin: "top center",
        translate: interpolate(
          frame,
          [0, 14],
          ["0px 0px", `${i % 2 ? 520 : -520}px -380px`],
          {
            extrapolateRight: "clamp",
            easing: Easing.in(Easing.quad),
          },
        ),
        rotate: interpolate(
          frame,
          [0, 14],
          ["0deg", `${i % 2 ? 38 : -34}deg`],
          { extrapolateRight: "clamp" },
        ),
        opacity: interpolate(frame, [8, 14], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    />
  );
};

// 右半："不查"——日历一页页撕飞 → 医院排长队 → 鱼竿积灰 → 小孙子转眼长大
export const NoCheckHalf: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rodS = HALF_W / 640;

  return (
    <>
      {/* ① 0–3.5s 日历 */}
      <Sequence durationInFrames={3.5 * fps} layout="none">
        <Crop src="ref/K12.jpg" x={422} y={0} w={836} />
        {Array.from({ length: 12 }, (_, i) => (
          <Sequence
            key={i}
            from={4 + i * 6}
            durationInFrames={16}
            layout="none"
          >
            <TornPage i={i} />
          </Sequence>
        ))}
      </Sequence>

      {/* ② 3.5–6.5s 医院走廊排长队 */}
      <Sequence from={3.5 * fps} durationInFrames={3 * fps} layout="none">
        <Crop src="ref/L08.jpg" x={418} y={0} w={836} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(70,100,130,0.16)",
          }}
        />
        <Img
          src={staticFile("ref/queue_b.png")}
          style={{ position: "absolute", left: 700, bottom: 190, height: 560 }}
        />
        <Img
          src={staticFile("ref/queue_b.png")}
          style={{
            position: "absolute",
            left: 540,
            bottom: 140,
            height: 640,
            scale: "-1 1",
          }}
        />
        <Img
          src={staticFile("ref/cut_laozhou_side.png")}
          style={{
            position: "absolute",
            left: 300,
            bottom: 110,
            height: 760,
            transformOrigin: "bottom center",
            scale: `1 ${interpolate((frame - 3.5 * fps) % (1.5 * fps), [0, 0.75 * fps, 1.5 * fps], [1, 0.965, 1])}`,
          }}
        />
      </Sequence>

      {/* ③ 6.5–9.5s 墙角鱼竿积灰、结蜘蛛网 */}
      <Sequence from={6.5 * fps} durationInFrames={3 * fps} layout="none">
        <Crop
          src="ref/L03d.jpg"
          x={1030}
          y={180}
          w={640}
          zoom={interpolate(frame, [6.5 * fps, 9.5 * fps], [1, 1.08], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(150,145,140,1)",
            mixBlendMode: "saturation",
            opacity: interpolate(frame, [6.5 * fps, 9 * fps], [0, 0.55], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        />
        <svg
          width={HALF_W}
          height={HALF_H}
          style={{ position: "absolute", inset: 0 }}
        >
          {/* 鱼竿上的灰：沿竿身慢慢落下的灰点 */}
          {Array.from({ length: 22 }, (_, k) => {
            const t = 0.03 + ((k + 0.5) / 22) * 0.55; // 只落在柜子上方露出的竿身
            return (
              <circle
                key={k}
                cx={(1440 - 45 * t - 1030) * rodS + ((k * 37) % 13) - 6}
                cy={(230 + 520 * t - 180) * rodS + ((k * 53) % 9) - 4}
                r={6 + ((k * 7) % 4)}
                fill="rgba(205,200,192,0.95)"
                opacity={interpolate(
                  frame,
                  [6.8 * fps + k * 2, 7.4 * fps + k * 2],
                  [0, 1],
                  {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  },
                )}
              />
            );
          })}
          {/* 竿头和墙之间的蜘蛛网 */}
          <g
            transform={`translate(${598} ${270})`}
            stroke="rgba(255,255,255,0.9)"
            strokeWidth={2.5}
            fill="none"
            opacity={interpolate(frame, [7.2 * fps, 8.4 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })}
          >
            {[0, 30, 60, 90, 120].map((deg) => (
              <line
                key={deg}
                x1={0}
                y1={0}
                x2={Math.cos((deg * Math.PI) / 180) * 170}
                y2={Math.sin((deg * Math.PI) / 180) * 170}
              />
            ))}
            {[50, 95, 140].map((r) => (
              <path
                key={r}
                d={`M ${r} 0 Q ${r * 0.8} ${r * 0.45} ${r * 0.5} ${r * 0.87} Q ${r * 0.1} ${r * 0.9} 0 ${r}`}
              />
            ))}
          </g>
          {/* 小蜘蛛顺着丝慢慢降下来 */}
          <line
            x1={598 + 120}
            y1={270 + 40}
            x2={598 + 120}
            y2={interpolate(
              frame,
              [7.6 * fps, 9.4 * fps],
              [270 + 40, 270 + 300],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              },
            )}
            stroke="rgba(255,255,255,0.85)"
            strokeWidth={2}
          />
          <circle
            cx={598 + 120}
            cy={interpolate(
              frame,
              [7.6 * fps, 9.4 * fps],
              [270 + 40, 270 + 300],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              },
            )}
            r={11}
            fill="#2B2420"
            opacity={interpolate(frame, [7.6 * fps, 7.8 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })}
          />
        </svg>
      </Sequence>

      {/* ④ 9.5–12s 小孙子转一圈，从幼儿园长到上小学 */}
      <Sequence from={9.5 * fps} layout="none">
        <Crop src="ref/L03d.jpg" x={300} y={220} w={640} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(120,120,120,0.12)",
          }}
        />
        <Img
          src={staticFile("ref/cut_grandson4.png")}
          style={{
            position: "absolute",
            left: 347,
            bottom: 70,
            height: 560,
            transformOrigin: "bottom center",
            scale: `${interpolate(frame, [10.2 * fps, 10.5 * fps], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} 1`,
          }}
        />
        <Img
          src={staticFile("ref/cut_grandson8.png")}
          style={{
            position: "absolute",
            left: 329,
            bottom: 70,
            height: 760,
            transformOrigin: "bottom center",
            scale: `${interpolate(frame, [10.5 * fps, 10.8 * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} 1`,
            rotate: interpolate(
              frame,
              [10.8 * fps, 11.1 * fps, 11.4 * fps, 11.7 * fps],
              ["0deg", "-3deg", "3deg", "0deg"],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              },
            ),
          }}
        />
      </Sequence>
    </>
  );
};
