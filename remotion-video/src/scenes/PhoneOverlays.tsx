import type React from "react";
import {
  Easing,
  Img,
  Interactive,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  bob,
  clamp,
  fadeIn,
  SparkBurst,
  StaggerText,
} from "../components/motion";

// 手机屏幕在 AI 视频里一律背对镜头，弹出的内容用漫画气泡画在手机旁边。

// 漫画气泡：圆角卡片 + 一根指向手机的尾巴
const Bubble: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly tailTo: [number, number];
  readonly frame: number;
  readonly inAt: number;
  readonly outAt: number;
  readonly children: React.ReactNode;
}> = ({ x, y, w, tailTo, frame, inAt, outAt, children }) => {
  const grow = interpolate(frame, [inAt, inAt + 9], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.back(2.2)),
  });
  const shrink = interpolate(frame, [outAt, outAt + 6], [1, 0], {
    ...clamp,
    easing: Easing.in(Easing.back(2)),
  });
  const s = Math.min(grow, shrink);
  if (s <= 0) return null;
  // 尾巴的起点在气泡底边，靠近手机那一侧
  const bx = Math.min(Math.max(tailTo[0], x + 60), x + w - 60);
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", inset: 0, opacity: s }}
      >
        <path
          d={`M ${bx - 34} ${y + 10} L ${tailTo[0]} ${tailTo[1]} L ${bx + 34} ${y + 10} Z`}
          fill="#FFFFFF"
          stroke="#3B2A20"
          strokeWidth={6}
          strokeLinejoin="round"
        />
      </svg>
      <div
        style={{
          position: "absolute",
          left: x,
          bottom: 1080 - y,
          width: w,
          padding: 26,
          backgroundColor: "#FFFFFF",
          border: "6px solid #3B2A20",
          borderRadius: 32,
          boxShadow: "10px 12px 0 rgba(43,36,32,0.25)",
          scale: s,
          transformOrigin: `${bx - x}px 100%`,
          translate: `0px ${bob(frame, 0, 4, 36)}px`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

// SEG02：老周掏出手机看到的体检提醒，拇指按下"稍后提醒"后气泡被划走
const PhoneNoticeInner = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tap = 1.25 * fps;
  const out = 1.85 * fps;
  return (
    <>
      <Bubble
        x={30}
        y={420}
        w={560}
        tailTo={[520, 575]}
        frame={frame}
        inAt={0}
        outAt={out}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontFamily: "'Noto Sans SC'",
            fontSize: 26,
            color: "#8A7A6F",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              backgroundColor: "#D9443A",
              color: "#FFF",
              fontWeight: 900,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: 26,
            }}
          >
            工
          </div>
          单位工会 · 刚刚
        </div>
        <div
          style={{
            marginTop: 12,
            fontFamily: "'Noto Sans SC'",
            fontWeight: 900,
            fontSize: 40,
            color: "#2B2420",
          }}
        >
          年度体检预约提醒
        </div>
        <div
          style={{
            marginTop: 6,
            fontFamily: "'Noto Sans SC'",
            fontSize: 30,
            color: "#5A4A3F",
            lineHeight: 1.4,
          }}
        >
          本年度职工体检已开始预约，请于月底前完成。
        </div>
        <div style={{ marginTop: 18, display: "flex", gap: 16 }}>
          {["立即预约", "稍后提醒"].map((t, i) => (
            <div
              key={t}
              style={{
                flex: 1,
                textAlign: "center",
                padding: "10px 0",
                borderRadius: 16,
                fontFamily: "'Noto Sans SC'",
                fontWeight: 700,
                fontSize: 30,
                backgroundColor:
                  i === 1 && frame >= tap ? "#3B2A20" : "#EFE7DA",
                color: i === 1 && frame >= tap ? "#FFFFFF" : "#5A4A3F",
                scale:
                  i === 1
                    ? interpolate(
                        frame,
                        [tap - 2, tap, tap + 4],
                        [1, 0.9, 1],
                        clamp,
                      )
                    : 1,
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </Bubble>
      <SparkBurst
        frame={frame}
        at={tap}
        x={440}
        y={365}
        size={50}
        color="#3B2A20"
        rays={6}
      />
    </>
  );
};

export const PhoneNotice = Interactive.create({
  Component: PhoneNoticeInner,
  layout: "absolute-fill",
  schema: {},
});

// SEG17 结尾：设好复查提醒
const ReminderSetInner = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <Bubble
        x={700}
        y={300}
        w={430}
        tailTo={[1020, 455]}
        frame={frame}
        inAt={0}
        outAt={999}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: "#3FA66A",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              scale: interpolate(frame, [6, 14], [0, 1], {
                ...clamp,
                easing: Easing.out(Easing.back(3)),
              }),
            }}
          >
            <svg width={40} height={40} viewBox="0 0 40 40">
              <path
                d="M8 21 L17 30 L33 11"
                fill="none"
                stroke="#FFF"
                strokeWidth={6}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div
            style={{
              fontFamily: "'Noto Sans SC'",
              fontWeight: 900,
              fontSize: 40,
              color: "#2B2420",
            }}
          >
            提醒设置成功
          </div>
        </div>
        <div
          style={{
            marginTop: 14,
            fontFamily: "'ZCOOL KuaiLe'",
            fontSize: 46,
            color: "#3FA66A",
          }}
        >
          <StaggerText
            text="3 个月后 · 血脂复查"
            frame={frame}
            start={10}
            step={1}
          />
        </div>
      </Bubble>
      <SparkBurst
        frame={frame}
        at={8}
        x={760}
        y={200}
        size={70}
        color="#3FA66A"
      />
    </>
  );
};

export const ReminderSet = Interactive.create({
  Component: ReminderSetInner,
  layout: "absolute-fill",
  schema: {},
});

// R14 假片尾：定格 → 暗角 + "全剧终" → 唱片划停 → 算盘爷从下边爬上来拽掉"终"字 → 叉腰瞪向抽屉
const FakeEndingInner = ({ still }: { readonly still: string }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleIn = 6;
  const scratch = 1.5 * fps;
  const climb = scratch + 4;
  const grab = climb + 12;
  const yank = grab + 8;
  const akimbo = yank + 10;
  const zhongY = interpolate(frame, [yank, yank + 14], [0, 900], {
    ...clamp,
    easing: Easing.in(Easing.quad),
  });
  const zhongR = interpolate(frame, [yank, yank + 14], [0, 220], clamp);
  const shake =
    frame >= scratch && frame < scratch + 6 ? Math.sin(frame * 3) * 6 : 0;

  return (
    <>
      <Img
        src={staticFile(still)}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          scale: interpolate(frame, [0, scratch], [1, 1.05], clamp),
          filter: `saturate(${interpolate(frame, [0, scratch, scratch + 2], [1, 0.75, 1], clamp)})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0) 35%, rgba(0,0,0,0.75) 100%)",
          opacity: interpolate(
            frame,
            [0, scratch, scratch + 3],
            [0, 1, 0.55],
            clamp,
          ),
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 380,
          display: "flex",
          justifyContent: "center",
          gap: 30,
          fontFamily: "'ZCOOL KuaiLe'",
          fontSize: 190,
          color: "#FFFFFF",
          textShadow: "0 8px 30px rgba(0,0,0,0.5)",
          opacity: fadeIn(frame, titleIn, 10),
          translate: `${shake}px 0px`,
        }}
      >
        <span>全</span>
        <span>剧</span>
        <span
          style={{
            display: "inline-block",
            translate: `0px ${zhongY}px`,
            rotate: `${zhongR}deg`,
          }}
        >
          终
        </span>
      </div>
      {/* 唱片划停：一道横向的白色划痕 */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 560,
          height: 6,
          backgroundColor: "#FFFFFF",
          opacity: interpolate(
            frame,
            [scratch, scratch + 1, scratch + 5],
            [0, 0.9, 0],
            clamp,
          ),
          scale: `${interpolate(frame, [scratch, scratch + 5], [0.2, 1.2], clamp)} 1`,
        }}
      />
      {/* 算盘爷：扒着下边爬上来 → 拽 → 叉腰 */}
      {frame >= climb && frame < grab ? (
        <Img
          src={staticFile("ref/A01_grab.png")}
          style={{
            position: "absolute",
            left: 900,
            width: 560,
            top: interpolate(frame, [climb, grab], [1080, 610], {
              ...clamp,
              easing: Easing.out(Easing.back(1.4)),
            }),
          }}
        />
      ) : null}
      {frame >= grab && frame < akimbo ? (
        <Img
          src={staticFile("ref/A01_pull.png")}
          style={{
            position: "absolute",
            left: 930,
            width: 600,
            top: interpolate(frame, [grab, yank, yank + 6], [367, 367, 470], {
              ...clamp,
              easing: Easing.in(Easing.quad),
            }),
            rotate: `${interpolate(frame, [grab, yank, yank + 6], [0, -4, -14], clamp)}deg`,
          }}
        />
      ) : null}
      {frame >= akimbo ? (
        <Img
          src={staticFile("ref/A01_akimbo.png")}
          style={{
            position: "absolute",
            left: 900,
            width: 560,
            top: 500,
            scale: `-1 ${interpolate(frame, [akimbo, akimbo + 4, akimbo + 10], [0.85, 1.08, 1], clamp)}`,
            transformOrigin: "50% 100%",
          }}
        />
      ) : null}
      <SparkBurst
        frame={frame}
        at={yank}
        x={1180}
        y={475}
        size={130}
        color="#FFE08A"
        rays={10}
      />
    </>
  );
};

export const FakeEnding = Interactive.create({
  Component: FakeEndingInner,
  layout: "absolute-fill",
  schema: {
    still: {
      type: "asset",
      default: "ref/SEG17_freeze.jpg",
      description: "定格画面",
    },
  },
});
