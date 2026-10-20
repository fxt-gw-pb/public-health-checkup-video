import { Easing, Interactive, interpolate, useCurrentFrame } from "remotion";
import { LedgerBook } from "../components/LedgerBook";
import {
  bob,
  clamp,
  SparkBurst,
  squash,
  StaggerText,
} from "../components/motion";
import { Paper } from "../components/Paper";

// R05-2 / R05-3：账簿从右边旋转着滑进来、落定时压一下，章节名逐字跳出，最后封面翻开。
const LedgerChapterInner = ({
  color,
  spine,
  book,
  chapter,
}: {
  readonly color: string;
  readonly spine: string;
  readonly book: string;
  readonly chapter: string;
}) => {
  const frame = useCurrentFrame();
  const land = 14;

  return (
    <Paper accent={color}>
      <div
        style={{
          position: "absolute",
          left: 380,
          top: 230 + (frame > land + 8 ? bob(frame, 0, 7, 40) : 0),
          translate: interpolate(
            frame,
            [0, land],
            ["1500px -120px", "0px 0px"],
            {
              ...clamp,
              easing: Easing.out(Easing.back(1.6)),
            },
          ),
          rotate: `${interpolate(frame, [0, land], [38, 0], { ...clamp, easing: Easing.out(Easing.back(1.6)) }) + (frame > land + 8 ? bob(frame, 9, 1.5, 56) : 0)}deg`,
        }}
      >
        <div
          style={{
            scale: squash(frame, land, 0.18),
            transformOrigin: "50% 100%",
          }}
        >
          <LedgerBook
            color={color}
            spine={spine}
            label={book}
            width={400}
            open={interpolate(frame, [42, 56], [0, 1], {
              ...clamp,
              easing: Easing.inOut(Easing.cubic),
            })}
          />
        </div>
      </div>
      <SparkBurst
        frame={frame}
        at={land}
        x={580}
        y={780}
        size={100}
        color={color}
      />
      <Interactive.Div
        name="章节名"
        style={{
          position: "absolute",
          left: 900,
          top: 430,
          fontFamily: "'ZCOOL KuaiLe'",
          fontSize: 124,
          color: "#2B2420",
        }}
      >
        <StaggerText text={chapter} frame={frame} start={12} step={3} />
      </Interactive.Div>
      <div
        style={{
          position: "absolute",
          left: 905,
          top: 590,
          height: 14,
          borderRadius: 7,
          backgroundColor: color,
          width: interpolate(frame, [28, 40], [0, 620], {
            ...clamp,
            easing: Easing.out(Easing.cubic),
          }),
        }}
      />
    </Paper>
  );
};

export const LedgerChapter = Interactive.create({
  Component: LedgerChapterInner,
  layout: "absolute-fill",
  schema: {
    color: { type: "color", default: "#3E8FD1", description: "账簿颜色" },
    spine: { type: "color", default: "#2B6498", description: "书脊颜色" },
    book: { type: "string", default: "时间账", description: "封面贴签" },
    chapter: {
      type: "string",
      default: "第二笔 · 时间账",
      description: "章节名",
    },
  },
});
