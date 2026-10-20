"""算出 Main.tsx 时间线的总帧数，并写回 Root.tsx 的 ZhouTieSuan 组合。

总帧数 = 所有 TransitionSeries.Sequence 的时长之和 − 每个 Transition 的重叠帧数。
用法：python3 scripts/duration.py（在 remotion-video 目录下）
"""
import re
from pathlib import Path

FPS = 24
main = Path("src/Main.tsx").read_text()
# 先把 const xxx = linearTiming({ durationInFrames: N }) 这类命名的转场时长找出来
named = {
    m.group(1): eval(m.group(2).replace("fps", str(FPS)))
    for m in re.finditer(r"const (\w+) = linearTiming\(\{ durationInFrames: ([^}]+?) \}\)", main)
}

total = 0
for m in re.finditer(r"<TransitionSeries\.Sequence\s+name=\"[^\"]+\"\s+durationInFrames=\{([^}]+)\}", main):
    total += eval(m.group(1).replace("fps", str(FPS)))
for m in re.finditer(r"<TransitionSeries\.Transition\s+presentation=\{[^}]+\}\s+timing=\{(.+?)\}\s*/>", main, re.S):
    t = m.group(1).strip()
    inline = re.search(r"durationInFrames: ([^ }]+)", t)
    total -= eval(inline.group(1).replace("fps", str(FPS))) if inline else named[t]
total = int(total)

root = Path("src/Root.tsx")
s = root.read_text()
s = re.sub(r'(id="ZhouTieSuan"[^/]*?durationInFrames=\{)\d+', lambda m: m.group(1) + str(total), s, flags=re.S)
s = re.sub(r"// Main 的时长 = .*", f"// Main 的时长 = 各段之和 − 各转场重叠 = {total} 帧 ≈ {total / FPS:.1f}s（用 scripts/duration.py 重新计算）。", s)
root.write_text(s)
print(total, "frames =", round(total / FPS, 1), "s")
