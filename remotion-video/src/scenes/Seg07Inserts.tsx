import {
  Easing,
  Img,
  Interactive,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// SEG07 上的两个插入画面（AI 视频里不放可读文字，文字都在这里画）：
// R07 手机里的体检套餐购物页，疯狂"加购"；R08 清单特写，"妇科彩超"被算盘爷指出来。

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ── R07 套餐购物页 ──
const PhoneShopInner = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // 越点越快：点击间隔从 6 帧缩到 2 帧
  const taps = Math.floor(
    interpolate(frame, [4, 1.5 * fps], [0, 26], {
      ...clamp,
      easing: Easing.in(Easing.quad),
    }),
  );
  const tapPhase = interpolate(frame % 3, [0, 2], [1, 0]);

  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(43,36,32,0.62)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 960 - 270,
          top: 50,
          width: 540,
          height: 980,
          borderRadius: 64,
          backgroundColor: "#1F1F1F",
          border: "6px solid #3B2A20",
          padding: 22,
          translate: interpolate(frame, [0, 6], ["0px 700px", "0px 0px"], {
            ...clamp,
            easing: Easing.out(Easing.back(1.4)),
          }),
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 44,
            backgroundColor: "#FFFFFF",
            overflow: "hidden",
            fontFamily: "'Noto Sans SC'",
            color: "#2B2420",
            position: "relative",
          }}
        >
          <div
            style={{
              height: 90,
              backgroundColor: "#F4E9D8",
              display: "flex",
              alignItems: "center",
              paddingLeft: 30,
              fontSize: 32,
              fontWeight: 700,
            }}
          >
            〈 体检商城
          </div>
          {/* 商品主图：平涂的体检夹板 */}
          <div
            style={{
              height: 300,
              backgroundColor: "#FFF3D1",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <svg width={200} height={240} viewBox="0 0 200 240">
              <rect
                x={20}
                y={30}
                width={160}
                height={200}
                rx={16}
                fill="#FFFFFF"
                stroke="#3B2A20"
                strokeWidth={6}
              />
              <rect
                x={65}
                y={14}
                width={70}
                height={34}
                rx={8}
                fill="#C08A3E"
                stroke="#3B2A20"
                strokeWidth={6}
              />
              <path
                d="M100 85 v60 M70 115 h60"
                stroke="#D9443A"
                strokeWidth={18}
                strokeLinecap="round"
              />
              {[170, 195].map((y) => (
                <line
                  key={y}
                  x1={50}
                  y1={y}
                  x2={150}
                  y2={y}
                  stroke="#BDBDB8"
                  strokeWidth={8}
                  strokeLinecap="round"
                />
              ))}
            </svg>
          </div>
          <div style={{ padding: "22px 28px 0" }}>
            <Interactive.Div
              name="套餐名"
              style={{ fontSize: 40, fontWeight: 900, lineHeight: 1.25 }}
            >
              至尊豪华全身 VIP 体检套餐
            </Interactive.Div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                marginTop: 16,
              }}
            >
              {[
                "全身 PET-CT",
                "肿瘤标志物全套",
                "基因检测",
                "妇科彩超",
                "微量元素",
              ].map((t) => (
                <span
                  key={t}
                  style={{
                    fontSize: 24,
                    padding: "4px 12px",
                    borderRadius: 10,
                    backgroundColor: "#FDECEA",
                    color: "#D9443A",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
            <Interactive.Div
              name="价格"
              style={{
                marginTop: 22,
                fontSize: 84,
                fontWeight: 900,
                color: "#D9443A",
              }}
            >
              ¥8888
            </Interactive.Div>
          </div>
          {/* 购物车角标 */}
          <div
            style={{
              position: "absolute",
              right: 34,
              top: 20,
              width: 52,
              height: 48,
            }}
          >
            <svg width={52} height={48} viewBox="0 0 52 48">
              <path
                d="M3 6 h8 l6 26 h24 l6 -18 H14"
                fill="none"
                stroke="#3B2A20"
                strokeWidth={5}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <circle cx={20} cy={41} r={4} fill="#3B2A20" />
              <circle cx={38} cy={41} r={4} fill="#3B2A20" />
            </svg>
            <span
              style={{
                position: "absolute",
                right: -14,
                top: -6,
                minWidth: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#D9443A",
                color: "#FFFFFF",
                fontSize: 24,
                fontWeight: 900,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                scale: 1 + 0.25 * tapPhase,
              }}
            >
              {taps + 1}
            </span>
          </div>
          <div
            style={{
              position: "absolute",
              left: 28,
              right: 28,
              bottom: 34,
              height: 104,
              borderRadius: 52,
              backgroundColor: "#D9443A",
              color: "#FFFFFF",
              fontSize: 42,
              fontWeight: 900,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              scale: 1 - 0.06 * tapPhase,
            }}
          >
            加入购物车
          </div>
          {/* 拇指点击的涟漪 + 飘起的 +1 */}
          <div
            style={{
              position: "absolute",
              left: 270 - 22 - 60,
              bottom: 34 + 52 - 60,
              width: 120,
              height: 120,
              borderRadius: 60,
              border: "6px solid rgba(255,255,255,0.9)",
              scale: 1.4 - 0.8 * tapPhase,
              opacity: tapPhase,
            }}
          />
          <div
            style={{
              position: "absolute",
              right: 70,
              bottom: 150 + 40 * (1 - tapPhase),
              fontSize: 40,
              fontWeight: 900,
              color: "#D9443A",
              opacity: tapPhase,
            }}
          >
            +1
          </div>
        </div>
      </div>
    </>
  );
};

export const PhoneShopInsert = Interactive.create({
  Component: PhoneShopInner,
  layout: "absolute-fill",
  schema: {},
});

// ── R08 清单特写 ──
const ITEMS = [
  "血常规",
  "尿常规",
  "全身 PET-CT",
  "肿瘤标志物全套",
  "骨密度",
  "基因检测",
  "心脏彩超",
  "妇科彩超",
  "微量元素",
  "中医体质辨识",
];
const HIT = 7; // "妇科彩超"

const ListInner = ({ hitItem }: { readonly hitItem: string }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items = ITEMS.map((t, i) => (i === HIT ? hitItem : t));
  const rowH = 84;
  const point = 1.3 * fps;

  return (
    <>
      <Img
        src={staticFile("ref/SEG07_floor.jpg")}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "blur(10px) brightness(0.8)",
          scale: 1.05,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 960 - 330,
          top: -120,
          width: 600,
          height: 1400,
          backgroundColor: "#F7F3EC",
          border: "6px solid #3B2A20",
          rotate: "-5deg",
          boxShadow: "18px 22px 0 rgba(43,36,32,0.28)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            translate: interpolate(
              frame,
              [0, point],
              ["0px 40px", "0px -120px"],
              { ...clamp, easing: Easing.out(Easing.quad) },
            ),
          }}
        >
          {items.map((t, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 40,
                right: 40,
                top: 300 + i * rowH,
                height: rowH - 14,
                display: "flex",
                alignItems: "center",
                gap: 22,
                fontFamily: "'Noto Sans SC'",
                fontWeight: 700,
                fontSize: 44,
                color: "#4A4A4E",
                borderRadius: 10,
                paddingLeft: 12,
                backgroundColor:
                  i === HIT
                    ? `rgba(255,214,64,${interpolate(frame, [point, point + 6], [0, 0.95], clamp)})`
                    : "transparent",
                opacity: interpolate(frame, [i * 2, i * 2 + 3], [0, 1], clamp),
                scale:
                  i === HIT
                    ? interpolate(
                        frame,
                        [point, point + 6, point + 10],
                        [1, 1.12, 1.06],
                        clamp,
                      )
                    : 1,
              }}
            >
              <span
                style={{
                  width: 34,
                  height: 34,
                  border: "4px solid #8A8A86",
                  borderRadius: 6,
                  flexShrink: 0,
                }}
              />
              {t}
            </div>
          ))}
        </div>
      </div>
      {/* 算盘爷从右边伸出手指，正好指着那一行 */}
      <Img
        src={staticFile("ref/A01_point.png")}
        style={{
          position: "absolute",
          left: 1060,
          top: 440,
          width: 620,
          translate: interpolate(
            frame,
            [point - 8, point],
            ["700px 0px", "0px 0px"],
            {
              ...clamp,
              easing: Easing.out(Easing.back(1.5)),
            },
          ),
        }}
      />
    </>
  );
};

export const ListInsert = Interactive.create({
  Component: ListInner,
  layout: "absolute-fill",
  schema: {
    hitItem: {
      type: "string",
      default: "妇科彩超",
      description: "被指出来的那一项（备选：儿童生长发育评估）",
    },
  },
});
