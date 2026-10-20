"""根据 Main.tsx 的时间线生成 src/soundCues.ts：背景音乐分段、转场与字卡音效、对白区间（音乐自动避让）。
改了时间线或字幕后重跑：python3 scripts/sound.py
"""
import json
import re
from pathlib import Path

FPS = 24
main = Path("src/Main.tsx").read_text()
named = {
    m.group(1): int(eval(m.group(2).replace("fps", str(FPS))))
    for m in re.finditer(r"const (\w+) = linearTiming\(\{\s*durationInFrames: ([^}]+?),?\s*\}\)", main)
}
pattern = (
    r'<TransitionSeries\.(?:Sequence\s+name="([^"]+)"\s+durationInFrames=\{([^}]+)\}'
    r"|Transition\s+presentation=\{(\w+)\(\)\}\s+timing=\{(.+?)\}\s*/>)"
)
pos, seq, transitions, total = 0, {}, [], 0
for m in re.finditer(pattern, main, re.S):
    if m.group(1):
        dur = int(eval(m.group(2).replace("fps", str(FPS))))
        seq[m.group(1)] = (pos, dur)
        pos += dur
    else:
        t = m.group(4).strip()
        inline = re.search(r"durationInFrames: ([^ ,}]+)", t)
        d = int(eval(inline.group(1).replace("fps", str(FPS)))) if inline else named[t]
        pos -= d
        transitions.append((m.group(3), pos, d))
total = pos


def S(prefix):
    return next(v for k, v in seq.items() if k.startswith(prefix))


# ── 背景音乐：按段落换曲，段与段之间交叉淡化 ──
# (曲目, 起点片段, 起点偏移帧, 终点片段, 终点是片段的开头还是结尾, 曲目内起始秒)
music_plan = [
    ("Fluffing_a_Duck", "SEG01", 0, "SEG02", "end", 0),  # 市井、俏皮
    ("Sneaky_Snitch", "SEG03", 0, "SEG04", "end", 0),  # 夜里算盘醒来，神秘又滑稽
    ("Monkeys_Spinning_Monkeys", "R05-1", 0, "SEG09", "end", 0),  # 金钱账：轻快推进
    ("Carefree", "R09", 0, "SEG14", "end", 0),  # 时间账：轻松
    ("Investigations", "R05-3", 0, "SEG15", "end", 0),  # 报告恐慌：紧张又搞笑
    ("Carefree", "R13", 0, "R14", "scratch", 40),  # 温暖 → 假片尾被唱片划停
    ("Sneaky_Snitch", "SEG17 抽屉", 0, "SEG17 抽屉", "end", 30),  # 算盘爷又出来管事
    ("Fluffing_a_Duck", "SEG18", 0, "R16", "end", 0),  # 尾声主旋律再现
]
music = []
for track, a, aoff, b, bmode, trim in music_plan:
    s0 = S(a)[0] + aoff
    if bmode == "end":
        s1 = S(b)[0] + S(b)[1]
    elif bmode == "scratch":
        s1 = S(b)[0] + 36  # R14 里唱片划停的那一帧
    else:
        s1 = S(b)[0]
    music.append({"src": f"audio/music/{track}.mp3", "from": s0, "dur": s1 - s0, "trim": int(trim * FPS), "hardEnd": bmode == "scratch"})

# ── 对白区间：音乐在这些时间里压低 ──
caps = Path("src/captions.ts").read_text()
cap_seq = {
    "SEG01": "SEG01", "SEG02": "SEG02", "SEG03": "SEG03", "SEG04": "SEG04", "SEG05": "SEG05", "SEG06": "SEG06",
    "SEG07": "SEG07", "SEG08": "SEG08", "SEG09": "SEG09", "SEG10a": "SEG10 没时间", "SEG10b": "SEG10 上午",
    "SEG13": "SEG13", "SEG14": "SEG14", "SEG15": "SEG15", "SEG16": "SEG16", "SEG17a": "SEG17 伸懒腰",
    "SEG17b": "SEG17 抽屉", "SEG18": "SEG18",
}
dialog = []
for key, block in re.findall(r"  (\w+): \[\n(.*?)\n  \],", caps, re.S):
    base = S(cap_seq[key])[0]
    for a, b in re.findall(r"from: ([\d.]+), to: ([\d.]+)", block):
        dialog.append([base + round(float(a) * FPS), base + round(float(b) * FPS)])
r01 = S("R01")
dialog.append([r01[0], r01[0] + int(7.7 * FPS)])  # 人物介绍旁白
dialog.sort()

# ── 音效 ──
sfx = []


def add(frame, name, vol=0.6):
    sfx.append({"at": int(frame), "src": f"audio/sfx/{name}.wav", "vol": vol})


for kind, start, d in transitions:
    if kind == "beadWipe":
        add(start, "whoosh", 0.5)
        add(start + 16, "abacus-clack", 0.75)
    elif kind in ("paperIn", "paperOut", "pageTurn"):
        add(start + 1, "page-turn", 0.65)
    elif kind in ("zoomThrough", "doorsIn", "doorsOut"):
        add(start, "whoosh", 0.55)
    elif kind == "whipPan":
        add(start, "whip", 0.7)

s = S("R01")[0]
add(s, "shutter-old", 0.6)
add(s + int(5.05 * FPS) - 2, "stamp", 0.5)
s = S("R02")[0]
for i in range(7):
    add(s + 2 + i * 4 + 7, "abacus-tick", 0.55)
add(s + 40, "ding", 0.25)
s = S("SEG02")[0] + int(5.1 * FPS)
add(s, "pop", 0.5)
add(s + 30, "mouse-click", 0.6)
add(s + 44, "whoosh", 0.3)
s = S("R05-1")[0]
for f in (11, 17, 23):
    add(s + f, "book-thud", 0.6)
add(s + 56, "page-turn", 0.5)
s = S("SEG05")[0]
add(s + 52, "stamp", 0.65)
add(s + int(7.55 * FPS), "abacus-tick", 0.6)
s = S("SEG07")[0]
r07 = s + int(2.9 * FPS)
for f in (4, 10, 15, 19, 23, 26, 29, 32, 35):
    add(r07 + f, "mouse-click", 0.35)
add(s + int(8 * FPS) + int(1.3 * FPS), "ding", 0.35)
s = S("R09")[0]
for f in (8, 22, 36):
    add(s + f, "book-thud", 0.5)
for f in (10, 24):
    add(s + f, "abacus-tick", 0.5)
add(s + 42, "ding", 0.3)
for prefix in ("R05-2", "R05-3"):
    s = S(prefix)[0]
    add(s + 14, "book-thud", 0.6)
    add(s + 42, "page-turn", 0.45)
s = S("R13")[0]
for f in (15, 21, 27):
    add(s + f, "pop", 0.35)
add(s + 60, "stamp", 0.7)
s = S("R14")[0]
add(s + 36, "record-scratch", 0.8)
add(s + 60, "whoosh", 0.5)
add(s + 70, "book-thud", 0.5)
s = S("SEG17 抽屉")[0]
add(s + 197, "ding", 0.45)
s = S("R16")[0]
for f in (36, 54, 72):
    add(s + f, "abacus-tick", 0.5)
for f in (150, 158, 166):
    add(s + f, "abacus-clack", 0.7)

out = [
    "// 由 scripts/sound.py 生成：背景音乐分段、音效时间点、对白区间（单位：成片帧，24fps）。改时间线后重跑。",
    f"export const TOTAL_FRAMES = {total};",
    f"export const MUSIC = {json.dumps(music, ensure_ascii=False)} as const;",
    f"export const SFX = {json.dumps(sorted(sfx, key=lambda x: x['at']), ensure_ascii=False)} as const;",
    f"export const DIALOG: readonly (readonly [number, number])[] = {json.dumps(dialog)};",
    "",
]
Path("src/soundCues.ts").write_text("\n".join(out))
print(f"total {total} frames | music {len(music)} segments | sfx {len(sfx)} | dialog {len(dialog)}")
for m in music:
    print(f"  {m['src'].split('/')[-1]:32s} {m['from'] / FPS:6.1f}s → {(m['from'] + m['dur']) / FPS:6.1f}s")
