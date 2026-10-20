import {
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// R06：叠在 SEG05 镜头 1（固定机位）上——账簿两栏写着"体检 / 不查"，
// 老周喊"亏"时头顶盖下一个红印章，算珠第 7.6 秒撞上它，印章翻滚着飞走。
// 坐标按 SEG05 画面（1280×720）测量，×1.5 换算到成片 1920×1080。
const MoneyLedgerOverlayInner = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hit = 7.55 * fps;
  const shotEnd = 8.2 * fps;

  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: interpolate(frame, [shotEnd - 4, shotEnd], [1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <Interactive.Div
          name="左栏 体检"
          style={{
            position: "absolute",
            left: 170,
            top: 560,
            fontFamily: "'ZCOOL KuaiLe'",
            fontSize: 110,
            color: "#6B3F22",
            rotate: "-4deg",
            opacity: interpolate(frame, [0.3 * fps, 0.8 * fps], [0, 0.9], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          体检
        </Interactive.Div>
        <Interactive.Div
          name="右栏 不查"
          style={{
            position: "absolute",
            left: 1480,
            top: 560,
            fontFamily: "'ZCOOL KuaiLe'",
            fontSize: 110,
            color: "#6B3F22",
            rotate: "4deg",
            opacity: interpolate(frame, [0.6 * fps, 1.1 * fps], [0, 0.9], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          不查
        </Interactive.Div>
      </div>
      {/* "亏"字红印章：2.2 秒盖下，7.55 秒被算珠撞飞 */}
      <Interactive.Div
        name="亏字印章"
        style={{
          position: "absolute",
          left: 692 - 80,
          top: 142 - 80,
          width: 160,
          height: 160,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          border: "9px solid #D9443A",
          borderRadius: 18,
          backgroundColor: "rgba(255,255,255,0.35)",
          fontFamily: "'ZCOOL KuaiLe'",
          fontSize: 118,
          color: "#D9443A",
          opacity: interpolate(
            frame,
            [2.15 * fps, 2.2 * fps, hit + 10, hit + 16],
            [0, 1, 1, 0],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          ),
          scale: interpolate(frame, [2.15 * fps, 2.15 * fps + 6], [2.2, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.back(2)),
          }),
          translate: interpolate(
            frame,
            [hit, hit + 16],
            ["0px 0px", "520px -260px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.quad),
            },
          ),
          rotate: interpolate(
            frame,
            [2.15 * fps, 2.2 * fps, hit, hit + 16],
            ["-8deg", "-8deg", "-8deg", "300deg"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          ),
        }}
      >
        亏
      </Interactive.Div>
    </>
  );
};

export const MoneyLedgerOverlay = Interactive.create({
  Component: MoneyLedgerOverlayInner,
  layout: "absolute-fill",
  schema: {},
});
