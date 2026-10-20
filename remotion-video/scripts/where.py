"""列出 Main.tsx 里每个片段在成片中的起始帧，方便定位和截图检查。
用法：python3 scripts/where.py [片段名关键词]
"""
import re
import sys
from pathlib import Path

FPS = 24
s = Path("src/Main.tsx").read_text()
named = {
    m.group(1): int(eval(m.group(2).replace("fps", str(FPS))))
    for m in re.finditer(r"const (\w+) = linearTiming\(\{\s*durationInFrames: ([^}]+?),?\s*\}\)", s)
}
pos = 0
pattern = (
    r'<TransitionSeries\.(?:Sequence\s+name="([^"]+)"\s+durationInFrames=\{([^}]+)\}'
    r"|Transition\s+presentation=\{\w+\(\)\}\s+timing=\{(.+?)\}\s*/>)"
)
for m in re.finditer(pattern, s, re.S):
    if m.group(1):
        dur = int(eval(m.group(2).replace("fps", str(FPS))))
        if len(sys.argv) < 2 or sys.argv[1] in m.group(1):
            print(f"{pos:6d}  {pos / FPS:7.2f}s  {dur:4d}f  {m.group(1)}")
        pos += dur
    else:
        t = m.group(3).strip()
        inline = re.search(r"durationInFrames: ([^ ,}]+)", t)
        pos -= int(eval(inline.group(1).replace("fps", str(FPS)))) if inline else named[t]
