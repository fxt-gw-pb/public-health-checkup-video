import { Easing, Interactive, interpolate, useCurrentFrame } from "remotion";
import { Bead } from "../components/Bead";
import {
  bob,
  clamp,
  dropY,
  SparkBurst,
  squash,
  StaggerText,
} from "../components/motion";
import { Paper } from "../components/Paper";

// R02 片名卡：一排算珠带重力落下，落地压扁回弹、迸出火花，对应的字随之跳出；之后整排字像波浪一样轻轻起伏。
const TitleCardInner = ({
  title,
  subtitle,
}: {
  readonly title: string;
  readonly subtitle: string;
}) => {
  const frame = useCurrentFrame();
  const chars = [...title];
  const step = 4;
  const colW = 212;
  const left0 = 960 - (chars.length * colW) / 2;

  return (
    <Paper>
      {chars.map((ch, i) => {
        const start = 2 + i * step;
        const land = start + 7;
        const cx = left0 + i * colW + colW / 2;
        const wave = frame > land + 12 ? bob(frame, i * 6, 7, 40) : 0;
        return (
          <div key={i}>
            <div
              style={{
                position: "absolute",
                left: cx - 75,
                top: 290 + wave,
                translate: `0px ${dropY(frame, start, land, -560)}px`,
                scale: squash(frame, land, 0.32),
                transformOrigin: "50% 100%",
              }}
            >
              <Bead width={150} />
            </div>
            <SparkBurst frame={frame} at={land} x={cx} y={370} size={64} />
            <div
              style={{
                position: "absolute",
                left: cx - 100,
                width: 200,
                top: 400 + wave,
                textAlign: "center",
                fontFamily: "'ZCOOL KuaiLe'",
                fontSize: 176,
                lineHeight: 1,
                color: i >= 4 ? "#A8761A" : "#2B2420",
                opacity: interpolate(frame, [land, land + 2], [0, 1], clamp),
                scale: interpolate(frame, [land, land + 10], [0.2, 1], {
                  ...clamp,
                  easing: Easing.out(Easing.back(3)),
                }),
                rotate: `${interpolate(frame, [land, land + 10], [i % 2 ? 18 : -18, 0], clamp)}deg`,
              }}
            >
              {ch}
            </div>
          </div>
        );
      })}
      {/* 下划线一笔扫过 */}
      <div
        style={{
          position: "absolute",
          left: left0 + 20,
          top: 612,
          height: 14,
          borderRadius: 7,
          backgroundColor: "#E0A526",
          width: interpolate(frame, [36, 48], [0, chars.length * colW - 40], {
            ...clamp,
            easing: Easing.out(Easing.cubic),
          }),
        }}
      />
      <Interactive.Div
        name="副标题"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 690,
          textAlign: "center",
          fontFamily: "'Noto Sans SC'",
          fontWeight: 700,
          fontSize: 58,
          letterSpacing: 18,
          color: "#6B3F22",
        }}
      >
        <StaggerText text={subtitle} frame={frame} start={42} step={2} />
      </Interactive.Div>
    </Paper>
  );
};

export const TitleCard = Interactive.create({
  Component: TitleCardInner,
  layout: "absolute-fill",
  schema: {
    title: { type: "string", default: "周铁算的三笔账", description: "片名" },
    subtitle: {
      type: "string",
      default: "主动体检，科学体检",
      description: "副标题",
    },
  },
});
