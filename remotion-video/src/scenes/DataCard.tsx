import { Easing, Interactive, interpolate, useCurrentFrame } from "remotion";
import {
  bob,
  clamp,
  dropY,
  fadeIn,
  SparkBurst,
  squash,
  StaggerText,
} from "../components/motion";
import { Paper } from "../components/Paper";

// R13 数据卡：10 个小人依次跳上台，按比例被"点亮"（18.2% → 第 1 个全亮、第 2 个亮 82%），
// 亮了的小人开心地蹦一下；百分比数字跟着跑；最后"早发现 · 能管住"像印章一样盖下来，画面一震。青绿主题。
// 每个小人的 clipPath 用独立 id，避免多个 SVG 抢同一个 id 导致渲染闪烁。
const Person = ({
  id,
  fill,
  hop,
}: {
  readonly id: number;
  readonly fill: number;
  readonly hop: number;
}) => (
  <svg
    width={110}
    height={180}
    viewBox="0 0 110 180"
    style={{ overflow: "visible", translate: `0px ${-hop}px` }}
  >
    <defs>
      <clipPath id={`datacard-person-${id}`}>
        <circle cx="55" cy="36" r="30" />
        <path d="M14 172 L14 110 Q14 76 55 76 Q96 76 96 110 L96 172 Z" />
      </clipPath>
    </defs>
    <g clipPath={`url(#datacard-person-${id})`}>
      <rect x="0" y="0" width="110" height="180" fill="#D9CBB4" />
      <rect x="0" y="0" width={110 * fill} height="180" fill="#3FA66A" />
    </g>
    <circle
      cx="55"
      cy="36"
      r="30"
      fill="none"
      stroke="#3B2A20"
      strokeWidth="5"
    />
    <path
      d="M14 172 L14 110 Q14 76 55 76 Q96 76 96 110 L96 172 Z"
      fill="none"
      stroke="#3B2A20"
      strokeWidth="5"
    />
  </svg>
);

const DataCardInner = ({
  percent,
  headline,
  source,
}: {
  readonly percent: number;
  readonly headline: string;
  readonly source: string;
}) => {
  const frame = useCurrentFrame();
  const lit = interpolate(frame, [26, 48], [0, percent / 10], {
    ...clamp,
    easing: Easing.bezier(0.33, 1, 0.68, 1),
  });
  const stamp = 60;
  const shake =
    frame >= stamp && frame < stamp + 8
      ? Math.sin((frame - stamp) * 2.4) * (8 - (frame - stamp)) * 1.6
      : 0;
  const lines = headline.split("\n");

  return (
    <Paper accent="#3FA66A">
      <div
        style={{
          position: "absolute",
          inset: 0,
          translate: `${shake}px ${shake * 0.6}px`,
        }}
      >
        <Interactive.Div
          name="大字结论"
          style={{
            position: "absolute",
            left: 200,
            right: 140,
            top: 130,
            fontFamily: "'ZCOOL KuaiLe'",
            fontSize: 84,
            lineHeight: 1.3,
            color: "#2B2420",
          }}
        >
          {lines.map((l, i) => (
            <div key={i}>
              <StaggerText text={l} frame={frame} start={2 + i * 10} step={1} />
            </div>
          ))}
        </Interactive.Div>
        <div
          style={{
            position: "absolute",
            left: 200,
            top: 420,
            display: "flex",
            gap: 34,
          }}
        >
          {Array.from({ length: 10 }, (_, i) => {
            const start = 8 + i * 1.5;
            const land = start + 7;
            const fill = Math.min(1, Math.max(0, lit - i));
            const litAt = 26 + (i + 1) * 10;
            const hop =
              fill >= 1
                ? interpolate(
                    frame,
                    [litAt - 6, litAt, litAt + 6],
                    [0, 26, 0],
                    clamp,
                  ) + bob(frame, i * 9, 2, 30)
                : 0;
            return (
              <div
                key={i}
                style={{
                  translate: `0px ${dropY(frame, start, land, -600)}px`,
                }}
              >
                <div
                  style={{
                    scale: squash(frame, land, 0.2),
                    transformOrigin: "50% 100%",
                  }}
                >
                  <Person id={i} fill={fill} hop={hop} />
                </div>
              </div>
            );
          })}
        </div>
        <div
          style={{
            position: "absolute",
            left: 200,
            top: 640,
            fontFamily: "'Noto Sans SC'",
            fontWeight: 900,
            fontSize: 76,
            color: "#3FA66A",
            fontVariantNumeric: "tabular-nums",
            opacity: fadeIn(frame, 24, 4),
            scale:
              frame > 48
                ? interpolate(frame, [48, 52, 58], [1, 1.12, 1], clamp)
                : 1,
            transformOrigin: "0% 50%",
          }}
        >
          知晓率 {(lit * 10).toFixed(1)}%
        </div>
        <Interactive.Div
          name="早发现"
          style={{
            position: "absolute",
            right: 160,
            top: 750,
            padding: "14px 40px",
            backgroundColor: "#3FA66A",
            border: "6px solid #3B2A20",
            borderRadius: 20,
            fontFamily: "'ZCOOL KuaiLe'",
            fontSize: 80,
            color: "#FFFFFF",
            boxShadow: "10px 12px 0 rgba(43,36,32,0.2)",
            opacity: fadeIn(frame, stamp - 4, 2),
            scale: interpolate(
              frame,
              [stamp - 4, stamp, stamp + 6],
              [2.4, 0.92, 1],
              {
                ...clamp,
                easing: Easing.out(Easing.quad),
              },
            ),
            rotate: `${interpolate(frame, [stamp - 4, stamp], [-14, -4], clamp)}deg`,
          }}
        >
          早发现 · 能管住
        </Interactive.Div>
        <SparkBurst
          frame={frame}
          at={stamp}
          x={1540}
          y={810}
          size={150}
          color="#3FA66A"
          rays={10}
        />
        <Interactive.Div
          name="数据来源"
          style={{
            position: "absolute",
            left: 200,
            bottom: 90,
            fontFamily: "'Noto Sans SC'",
            fontSize: 30,
            color: "#8A7A6F",
            opacity: fadeIn(frame, 40, 10),
          }}
        >
          {source}
        </Interactive.Div>
      </div>
    </Paper>
  );
};

export const DataCard = Interactive.create({
  Component: DataCardInner,
  layout: "absolute-fill",
  schema: {
    percent: {
      type: "number",
      default: 18.2,
      min: 0,
      max: 100,
      step: 0.1,
      hiddenFromList: false,
      description: "百分比",
    },
    headline: {
      type: "string",
      default: "血脂异常的人里，\n不到两成知道自己有这个问题",
      description: "大字结论",
    },
    source: {
      type: "string",
      default: "数据来源：Xia Q, et al. 2023（中国成人血脂异常知晓率 18.2%）",
      description: "数据来源",
    },
  },
});
