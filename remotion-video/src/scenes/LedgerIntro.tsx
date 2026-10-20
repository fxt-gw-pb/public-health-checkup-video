import { Easing, Interactive, interpolate, useCurrentFrame } from "remotion";
import { LedgerBook } from "../components/LedgerBook";
import {
  bob,
  clamp,
  dropY,
  SparkBurst,
  squash,
  StaggerText,
} from "../components/motion";
import { Paper } from "../components/Paper";

// R05-1：三本账簿依次砸下来落地（压扁回弹 + 火花），站好后轻轻浮动；
// 然后蓝、绿两本向右退场，金色那本走到中间、放大、翻开封面——下一刻转场冲进账簿空间。
const BOOKS = [
  {
    color: "#E0A526",
    spine: "#A8761A",
    label: "金钱账",
    x: 520,
    start: 2,
    exit: 0,
  },
  {
    color: "#3E8FD1",
    spine: "#2B6498",
    label: "时间账",
    x: 960,
    start: 8,
    exit: 900,
  },
  {
    color: "#3FA66A",
    spine: "#2C7A4D",
    label: "健康账",
    x: 1400,
    start: 14,
    exit: 700,
  },
];

const LedgerIntroInner = () => {
  const frame = useCurrentFrame();
  const focus = interpolate(frame, [40, 58], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

  return (
    <Paper accent="#E0A526">
      {BOOKS.map((b, i) => {
        const land = b.start + 9;
        const isGold = i === 0;
        const x = isGold
          ? interpolate(focus, [0, 1], [b.x, 960])
          : b.x + focus * b.exit;
        const idle = frame > land + 12;
        return (
          <div key={b.label}>
            <div
              style={{
                position: "absolute",
                left: x - 170,
                top: 300 + (idle ? bob(frame, i * 11, 8, 44) : 0),
                translate: `0px ${dropY(frame, b.start, land, -900)}px`,
                scale: isGold ? interpolate(focus, [0, 1], [1, 1.28]) : 1,
                rotate: `${idle ? bob(frame, i * 7, 1.6, 60) : 0}deg`,
                opacity: isGold ? 1 : 1 - focus,
                zIndex: isGold ? 2 : 1,
              }}
            >
              <div
                style={{
                  scale: squash(frame, land, 0.22),
                  transformOrigin: "50% 100%",
                }}
              >
                <LedgerBook
                  color={b.color}
                  spine={b.spine}
                  label={b.label}
                  width={340}
                  open={
                    isGold
                      ? interpolate(frame, [56, 70], [0, 1], {
                          ...clamp,
                          easing: Easing.inOut(Easing.cubic),
                        })
                      : 0
                  }
                />
              </div>
            </div>
            <SparkBurst
              frame={frame}
              at={land}
              x={b.x}
              y={770}
              size={90}
              color={b.color}
            />
          </div>
        );
      })}
      <Interactive.Div
        name="章节名"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 90,
          textAlign: "center",
          fontFamily: "'ZCOOL KuaiLe'",
          fontSize: 96,
          color: "#2B2420",
        }}
      >
        <StaggerText text="第一笔 · 金钱账" frame={frame} start={44} step={2} />
      </Interactive.Div>
    </Paper>
  );
};

export const LedgerIntro = Interactive.create({
  Component: LedgerIntroInner,
  layout: "absolute-fill",
  schema: {},
});
