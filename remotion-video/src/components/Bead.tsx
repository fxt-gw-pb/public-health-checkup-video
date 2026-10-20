import type React from "react";

// 2D 平涂算珠（正面看是两头尖的扁菱形），描边色与风格圣经一致。
export const Bead: React.FC<{
  readonly width?: number;
  readonly fill?: string;
  readonly style?: React.CSSProperties;
}> = ({ width = 140, fill = "#4A2C1A", style }) => (
  <svg width={width} height={width * 0.56} viewBox="0 0 140 78" style={style}>
    <path
      d="M6 39 L36 8 Q70 0 104 8 L134 39 L104 70 Q70 78 36 70 Z"
      fill={fill}
      stroke="#3B2A20"
      strokeWidth={5}
      strokeLinejoin="round"
    />
    <path
      d="M40 16 Q70 9 98 16 L104 24 Q70 17 36 24 Z"
      fill="rgba(255,255,255,0.22)"
    />
  </svg>
);
