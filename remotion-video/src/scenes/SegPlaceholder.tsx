import { Interactive, useCurrentFrame, useVideoConfig } from "remotion";

// Seedance 视频还没生成时的占位画面：标出段落编号、内容和还剩多少秒，
// 方便先在完整时间线上看节奏。视频到位后整段替换成 <Video>。
const SegPlaceholderInner = ({
  seg,
  title,
  note,
  accent,
}: {
  readonly seg: string;
  readonly title: string;
  readonly note: string;
  readonly accent: string;
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const remaining = Math.max(0, (durationInFrames - frame) / fps).toFixed(1);

  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `repeating-linear-gradient(135deg, ${accent}22 0px, ${accent}22 40px, transparent 40px, transparent 80px)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 120,
          top: 110,
          padding: "10px 28px",
          backgroundColor: accent,
          border: "5px solid #3B2A20",
          borderRadius: 14,
          fontFamily: "'Noto Sans SC'",
          fontWeight: 900,
          fontSize: 56,
          color: "#FFFFFF",
        }}
      >
        {seg}
      </div>
      <div
        style={{
          position: "absolute",
          left: 120,
          right: 120,
          top: 300,
          fontFamily: "'ZCOOL KuaiLe'",
          fontSize: 110,
          color: "#2B2420",
        }}
      >
        {title}
      </div>
      <div
        style={{
          position: "absolute",
          left: 120,
          right: 120,
          top: 470,
          fontFamily: "'Noto Sans SC'",
          fontSize: 44,
          lineHeight: 1.6,
          color: "#5A4A3F",
        }}
      >
        {note}
      </div>
      <div
        style={{
          position: "absolute",
          right: 120,
          bottom: 100,
          fontFamily: "'Noto Sans SC'",
          fontSize: 40,
          color: "#8A7A6F",
        }}
      >
        待生成 · 剩余 {remaining}s
      </div>
    </>
  );
};

export const SegPlaceholder = Interactive.create({
  Component: SegPlaceholderInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
    seg: { type: "string", default: "SEG00", description: "段落编号" },
    title: { type: "string", default: "", description: "段落名称" },
    note: { type: "string", default: "", description: "内容说明" },
    accent: { type: "color", default: "#E0A526", description: "所属账的颜色" },
  },
});
