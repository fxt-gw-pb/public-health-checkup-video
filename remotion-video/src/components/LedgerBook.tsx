import type React from "react";

// 2D 平涂的线装账簿：彩色布面封面 + 深色书脊 + 米黄贴签。颜色区分三笔账。
export const LedgerBook: React.FC<{
  readonly color: string;
  readonly spine: string;
  readonly label: string;
  readonly width?: number;
  readonly open?: number; // 0 = 合上，1 = 封面翻到左边、露出内页
  readonly style?: React.CSSProperties;
}> = ({ color, spine, label, width = 360, open = 0, style }) => (
  <div
    style={{
      position: "relative",
      width,
      height: width * 1.36,
      ...style,
    }}
  >
    {/* 纸页厚度 */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        translate: "14px 14px",
        borderRadius: 18,
        backgroundColor: "#EBDDC4",
        border: "5px solid #3B2A20",
      }}
    />
    {/* 内页：封面翻开后露出账簿横线 */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: 18,
        backgroundColor: "#F7F0E2",
        border: "5px solid #3B2A20",
        backgroundImage:
          "repeating-linear-gradient(0deg, rgba(217,68,58,0.22) 0px, rgba(217,68,58,0.22) 3px, transparent 3px, transparent 34px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          fontFamily: "'ZCOOL KuaiLe'",
          fontSize: width * 0.2,
          color: "#2B2420",
          writingMode: "vertical-rl",
          letterSpacing: width * 0.02,
        }}
      >
        {label}
      </div>
      {/* 红色"账"字章 */}
      <div
        style={{
          position: "absolute",
          right: "10%",
          bottom: "8%",
          width: width * 0.26,
          height: width * 0.26,
          border: `${width * 0.018}px solid #D9443A`,
          borderRadius: width * 0.03,
          color: "#D9443A",
          fontFamily: "'ZCOOL KuaiLe'",
          fontSize: width * 0.17,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          rotate: "-10deg",
          opacity: Math.min(1, Math.max(0, (open - 0.7) / 0.3)),
          scale: 1.6 - 0.6 * Math.min(1, Math.max(0, (open - 0.7) / 0.3)),
        }}
      >
        账
      </div>
    </div>
    {/* 封面背面：翻过去以后出现在书的左边 */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: 18,
        backgroundColor: spine,
        border: "5px solid #3B2A20",
        transformOrigin: "0% 50%",
        scale: `${-Math.max(0, open - 0.5) * 2} 1`,
        opacity: open > 0.5 ? 1 : 0,
      }}
    />
    {/* 封面 */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: 18,
        backgroundColor: color,
        border: "5px solid #3B2A20",
        overflow: "hidden",
        transformOrigin: "0% 50%",
        // 2D 翻页：封面先往左边收窄到 0，再由"封面背面"从左边展开
        scale: `${Math.max(0, 1 - open * 2)} 1`,
        opacity: open < 0.5 ? 1 : 0,
        filter: `brightness(${1 - 0.3 * Math.min(1, open * 2)})`,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          width: "16%",
          backgroundColor: spine,
        }}
      />
      {[0.2, 0.4, 0.6, 0.8].map((t) => (
        <div
          key={t}
          style={{
            position: "absolute",
            left: "4%",
            top: `${t * 100}%`,
            width: "8%",
            height: 5,
            backgroundColor: "#F4E9D8",
            borderRadius: 3,
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          left: "30%",
          right: "12%",
          top: "16%",
          height: "52%",
          backgroundColor: "#F4E9D8",
          border: "4px solid #3B2A20",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'ZCOOL KuaiLe'",
          fontSize: width * 0.15,
          lineHeight: 1.15,
          color: "#2B2420",
          writingMode: "vertical-rl",
          letterSpacing: width * 0.01,
        }}
      >
        {label}
      </div>
    </div>
  </div>
);
