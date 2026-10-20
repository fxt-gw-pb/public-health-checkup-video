#!/usr/bin/env bash
# 把 Seedance 视频转成 Remotion 用的副本：统一 24fps 恒定帧率、关键帧间隔 12。
# Seedance 导出的 60fps 文件里重复帧分布不均，直接放进 24fps 时间线会在快动作处一顿一顿地"闪"。
# 用法：scripts/prep-clip.sh ../素材/05_seedance视频/SEG07_v1.mp4 SEG07
set -euo pipefail
ffmpeg -v error -y -i "$1" -vf fps=24 -c:v libx264 -preset slow -crf 15 -g 12 -pix_fmt yuv420p -c:a copy "public/seedance/$2.mp4"
echo "→ public/seedance/$2.mp4"
