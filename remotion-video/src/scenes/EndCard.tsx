import { Easing, Interactive, interpolate, useCurrentFrame } from "remotion";
import { Bead } from "../components/Bead";
import {
  clamp,
  fadeIn,
  SparkBurst,
  squash,
  StaggerText,
} from "../components/motion";
import { Paper } from "../components/Paper";

// R16 片尾行动卡：每条建议左边的算珠从画面外滚进来（边滚边转），停住时压一下、迸火花，文字随后滑出，
// 底下一道彩色马克笔划过。最后三颗算珠依次"咔哒"弹一下，呼应尾声里挂件的三声响。
const CLICK = [150, 158, 166];

const Row = ({
  frame,
  start,
  color,
  text,
  click,
}: {
  readonly frame: number;
  readonly start: number;
  readonly color: string;
  readonly text: string;
  readonly click: number;
}) => {
  const land = start + 14;
  const roll = interpolate(frame, [start, land], [-900, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const pulse = interpolate(
    frame,
    [click, click + 3, click + 9],
    [1, 1.35, 1],
    clamp,
  );
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 44,
        height: 120,
      }}
    >
      <div style={{ translate: `${roll}px 0px`, rotate: `${roll * 0.8}deg` }}>
        <div
          style={{
            scale:
              frame < click ? squash(frame, land, 0.25) : `${pulse} ${pulse}`,
          }}
        >
          <Bead width={120} fill={color} />
        </div>
      </div>
      <SparkBurst
        frame={frame}
        at={land}
        x={60}
        y={60}
        size={70}
        color={color}
      />
      <SparkBurst
        frame={frame}
        at={click}
        x={60}
        y={60}
        size={80}
        color={color}
      />
      <div style={{ position: "relative" }}>
        <div
          style={{
            position: "absolute",
            left: -8,
            bottom: 6,
            height: 26,
            borderRadius: 13,
            backgroundColor: color,
            opacity: 0.35,
            width: `${interpolate(frame, [land + 8, land + 22], [0, 104], { ...clamp, easing: Easing.out(Easing.cubic) })}%`,
          }}
        />
        <div
          style={{
            position: "relative",
            fontFamily: "'Noto Sans SC'",
            fontWeight: 900,
            fontSize: 60,
            color: "#2B2420",
            opacity: fadeIn(frame, land - 2, 5),
            translate: `${interpolate(frame, [land - 2, land + 10], [-40, 0], { ...clamp, easing: Easing.out(Easing.back(1.6)) })}px 0px`,
          }}
        >
          {text}
        </div>
      </div>
    </div>
  );
};

const EndCardInner = ({
  line1,
  line2,
  line3,
  credit,
  music,
}: {
  readonly line1: string;
  readonly line2: string;
  readonly line3: string;
  readonly credit: string;
  readonly music: string;
}) => {
  const frame = useCurrentFrame();

  return (
    <Paper>
      <Interactive.Div
        name="片尾标题"
        style={{
          position: "absolute",
          left: 260,
          top: 110,
          fontFamily: "'ZCOOL KuaiLe'",
          fontSize: 124,
          color: "#2B2420",
        }}
      >
        <StaggerText
          text="主动体检 · 科学体检"
          frame={frame}
          start={2}
          step={2}
        />
      </Interactive.Div>
      <div
        style={{
          position: "absolute",
          left: 260,
          top: 330,
          display: "flex",
          flexDirection: "column",
          gap: 40,
        }}
      >
        <Row
          frame={frame}
          start={22}
          color="#E0A526"
          text={line1}
          click={CLICK[0]}
        />
        <Row
          frame={frame}
          start={40}
          color="#3E8FD1"
          text={line2}
          click={CLICK[1]}
        />
        <Row
          frame={frame}
          start={58}
          color="#3FA66A"
          text={line3}
          click={CLICK[2]}
        />
      </div>
      <Interactive.Div
        name="署名"
        style={{
          position: "absolute",
          left: 260,
          right: 160,
          bottom: 96,
          fontFamily: "'Noto Sans SC'",
          fontSize: 34,
          color: "#8A7A6F",
          opacity: fadeIn(frame, 96, 16),
        }}
      >
        {credit}
      </Interactive.Div>
      <Interactive.Div
        name="音乐授权"
        style={{
          position: "absolute",
          left: 260,
          right: 160,
          bottom: 52,
          fontFamily: "'Noto Sans SC'",
          fontSize: 22,
          color: "#A89A8F",
          opacity: fadeIn(frame, 104, 16),
        }}
      >
        {music}
      </Interactive.Div>
    </Paper>
  );
};

export const EndCard = Interactive.create({
  Component: EndCardInner,
  layout: "absolute-fill",
  schema: {
    line1: {
      type: "string",
      default: "45 岁起，给自己建一份健康“底账”",
      description: "第一条",
    },
    line2: {
      type: "string",
      default: "按自己的风险选项目，问问家庭医生",
      description: "第二条",
    },
    line3: {
      type: "string",
      default: "报告上有箭头，3 个月内去复查",
      description: "第三条",
    },
    credit: {
      type: "string",
      default:
        "公共卫生传播学22级 第3大组第4小组　　使用工具：image2.5 seedance2.0 remotion",
      description: "署名",
    },
    music: {
      type: "string",
      default: "音乐：Kevin MacLeod（incompetech.com），CC BY 4.0",
      description: "音乐授权",
    },
  },
});
