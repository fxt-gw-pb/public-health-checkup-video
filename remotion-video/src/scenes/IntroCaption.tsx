import {
  Easing,
  Img,
  Interactive,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { clamp, fadeIn, SparkBurst, StaggerText } from "../components/motion";

// R01 人物介绍（7.9 秒，配旁白）：SEG01 最后一帧定格——镜头"咚"地推近一下再慢慢漂移，左侧暗角淡入（不是一下子出现），
// 名字写在一张斜贴的纸条上弹进来，金句像盖章一样砸下并迸出火花。
const IntroCaptionInner = ({ still }: { readonly still: string }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const punch = interpolate(frame, [0, 5], [1, 1.09], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const drift = interpolate(frame, [5, 7.9 * fps], [0, 0.06], clamp);
  // 三行字跟着旁白（public/audio/narration_R01.mp3）出现：0.1s 读名字、3.2s 读外号、5.0s 读金句
  const nick = Math.round(3.2 * fps);
  const stamp = Math.round(5.05 * fps);

  return (
    <>
      <Img
        name="定格画面"
        src={staticFile(still)}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          scale: punch + drift,
          transformOrigin: "68% 40%",
        }}
      />
      {/* 定格那一下的白闪，像相机快门 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#FFFFFF",
          opacity: interpolate(frame, [0, 1, 5], [0, 0.55, 0], clamp),
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(43,36,32,0.75) 0%, rgba(43,36,32,0.35) 55%, rgba(43,36,32,0) 80%)",
          opacity: fadeIn(frame, 1, 8),
        }}
      />
      <Interactive.Div
        name="姓名纸条"
        style={{
          position: "absolute",
          left: 120,
          top: 250,
          padding: "18px 36px",
          backgroundColor: "#F4E9D8",
          border: "5px solid #3B2A20",
          borderRadius: 10,
          boxShadow: "8px 10px 0 rgba(0,0,0,0.25)",
          fontFamily: "'ZCOOL KuaiLe'",
          fontSize: 66,
          color: "#2B2420",
          rotate: `${interpolate(frame, [2, 12], [-14, -3], { ...clamp, easing: Easing.out(Easing.back(2)) })}deg`,
          translate: `${interpolate(frame, [2, 12], [-700, 0], { ...clamp, easing: Easing.out(Easing.back(1.4)) })}px 0px`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "42%",
            top: -18,
            width: 110,
            height: 34,
            backgroundColor: "rgba(224,165,38,0.75)",
            rotate: "4deg",
          }}
        />
        周建国，56 岁，会计三十年
      </Interactive.Div>
      <Interactive.Div
        name="外号"
        style={{
          position: "absolute",
          left: 150,
          top: 410,
          fontFamily: "'ZCOOL KuaiLe'",
          fontSize: 80,
          color: "#FFFFFF",
          WebkitTextStroke: "7px #A8761A",
          paintOrder: "stroke fill",
        }}
      >
        <StaggerText text="人称“周铁算”" frame={frame} start={nick} step={2} />
      </Interactive.Div>
      <Interactive.Div
        name="金句"
        style={{
          position: "absolute",
          left: 140,
          top: 580,
          fontFamily: "'ZCOOL KuaiLe'",
          fontSize: 104,
          color: "#FFE08A",
          WebkitTextStroke: "8px #3B2A20",
          paintOrder: "stroke fill",
          opacity: fadeIn(frame, stamp - 3, 2),
          scale: interpolate(
            frame,
            [stamp - 3, stamp, stamp + 6],
            [1.8, 0.95, 1],
            { ...clamp, easing: Easing.out(Easing.quad) },
          ),
          rotate: `${interpolate(frame, [stamp - 3, stamp], [-6, -2], clamp)}deg`,
          transformOrigin: "left center",
        }}
      >
        这辈子，没算错过一笔账。
      </Interactive.Div>
      <SparkBurst
        frame={frame}
        at={stamp}
        x={900}
        y={640}
        size={130}
        color="#FFE08A"
        rays={10}
      />
    </>
  );
};

export const IntroCaption = Interactive.create({
  Component: IntroCaptionInner,
  layout: "absolute-fill",
  schema: {
    still: {
      type: "asset",
      default: "ref/SEG01_freeze.jpg",
      description: "定格画面",
    },
  },
});
