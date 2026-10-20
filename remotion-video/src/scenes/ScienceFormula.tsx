import type React from "react";
import { Easing, Interactive, interpolate, useCurrentFrame } from "remotion";
import {
  bob,
  clamp,
  dropY,
  fadeIn,
  SparkBurst,
  squash,
} from "../components/motion";
import { Paper } from "../components/Paper";

// R09 科学体检字卡：像在账本上列算式——三个方块依次砸下来落定，"=""+" 旋转弹入，
// 最后整道算式"啪"地亮一下，下面两行说明逐行滑出。琥珀金主题。
const Tile: React.FC<{
  readonly frame: number;
  readonly start: number;
  readonly bg: string;
  readonly color?: string;
  readonly children: React.ReactNode;
}> = ({ frame, start, bg, color = "#2B2420", children }) => {
  const land = start + 8;
  return (
    <div style={{ translate: `0px ${dropY(frame, start, land, -700)}px` }}>
      <div
        style={{
          scale: squash(frame, land, 0.25),
          transformOrigin: "50% 100%",
          padding: "20px 38px",
          border: "6px solid #3B2A20",
          borderRadius: 24,
          backgroundColor: bg,
          color,
          fontFamily: "'ZCOOL KuaiLe'",
          fontSize: 86,
          boxShadow: "10px 12px 0 rgba(43,36,32,0.18)",
          translate: `0px ${frame > land + 14 ? bob(frame, start, 4, 40) : 0}px`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

const Op: React.FC<{
  readonly frame: number;
  readonly start: number;
  readonly children: React.ReactNode;
}> = ({ frame, start, children }) => (
  <div
    style={{
      fontFamily: "'ZCOOL KuaiLe'",
      fontSize: 104,
      color: "#6B3F22",
      opacity: fadeIn(frame, start, 3),
      scale: interpolate(frame, [start, start + 10], [0, 1], {
        ...clamp,
        easing: Easing.out(Easing.back(3)),
      }),
      rotate: `${interpolate(frame, [start, start + 10], [-180, 0], clamp)}deg`,
    }}
  >
    {children}
  </div>
);

const ScienceFormulaInner = () => {
  const frame = useCurrentFrame();
  const flash = interpolate(frame, [42, 44, 52], [0, 1, 0], clamp);

  return (
    <Paper accent="#E0A526">
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 320,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 30,
          filter: `drop-shadow(0 0 ${30 * flash}px rgba(255,214,64,${flash}))`,
        }}
      >
        <Tile frame={frame} start={0} bg="#E0A526" color="#FFFFFF">
          科学体检
        </Tile>
        <Op frame={frame} start={10}>
          =
        </Op>
        <Tile frame={frame} start={14} bg="#FFFFFF">
          基础项目
        </Tile>
        <Op frame={frame} start={24}>
          +
        </Op>
        <Tile frame={frame} start={28} bg="#FFF3D1">
          按个人风险加项
        </Tile>
      </div>
      <SparkBurst
        frame={frame}
        at={42}
        x={960}
        y={330}
        size={160}
        color="#E0A526"
        rays={12}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 600,
          display: "flex",
          justifyContent: "center",
          gap: 200,
          fontFamily: "'Noto Sans SC'",
          fontWeight: 700,
          fontSize: 48,
          color: "#5A4A3F",
        }}
      >
        <Interactive.Div
          name="基础项目说明"
          style={{
            opacity: fadeIn(frame, 46, 6),
            translate: `0px ${interpolate(frame, [46, 56], [30, 0], { ...clamp, easing: Easing.out(Easing.cubic) })}px`,
          }}
        >
          血压 · 血糖 · 血脂
        </Interactive.Div>
        <Interactive.Div
          name="加项说明"
          style={{
            opacity: fadeIn(frame, 51, 6),
            translate: `0px ${interpolate(frame, [51, 61], [30, 0], { ...clamp, easing: Easing.out(Easing.cubic) })}px`,
          }}
        >
          吸烟、家族史、年龄……
        </Interactive.Div>
      </div>
    </Paper>
  );
};

export const ScienceFormula = Interactive.create({
  Component: ScienceFormulaInner,
  layout: "absolute-fill",
  schema: {},
});
