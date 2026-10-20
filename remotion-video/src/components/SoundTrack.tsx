import { Audio } from "@remotion/media";
import { interpolate, Sequence, staticFile } from "remotion";
import { DIALOG, MUSIC, SFX } from "../soundCues";

// 全片声音层（时间点来自 scripts/sound.py 生成的 src/soundCues.ts）：
// 背景音乐按段落换曲，段落交接处交叉淡化；有对白时音乐自动压低到 40%，说完再慢慢回来。
// 音乐已统一响度（-20 LUFS），对白是 Seedance 原声（约 -14 LUFS）。
const MUSIC_VOL = 0.34;
const DUCK = 0.4;
const RAMP = 8;

const duck = (abs: number) => {
  let dist = Infinity;
  for (const [a, b] of DIALOG) {
    if (abs >= a && abs <= b) return DUCK;
    dist = Math.min(dist, abs < a ? a - abs : abs - b);
  }
  return interpolate(dist, [0, RAMP], [DUCK, 1], { extrapolateRight: "clamp" });
};

export const SoundTrack = () => (
  <>
    <Sequence name="背景音乐" layout="none">
      {MUSIC.map((m, i) => (
        <Audio
          key={i}
          name={`音乐 ${m.src.split("/").pop()}`}
          src={staticFile(m.src)}
          from={m.from}
          durationInFrames={m.dur}
          trimBefore={m.trim}
          loop
          volume={(f) => {
            const fadeIn = interpolate(f, [0, 14], [0, 1], {
              extrapolateRight: "clamp",
            });
            const fadeOut = interpolate(
              f,
              [m.dur - (m.hardEnd ? 2 : 20), m.dur],
              [1, 0],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              },
            );
            return MUSIC_VOL * fadeIn * fadeOut * duck(m.from + f);
          }}
        />
      ))}
    </Sequence>
    {SFX.map((s, i) => (
      <Audio
        key={i}
        name={`音效 ${s.src.split("/").pop()}`}
        src={staticFile(s.src)}
        from={s.at}
        volume={s.vol}
      />
    ))}
  </>
);
