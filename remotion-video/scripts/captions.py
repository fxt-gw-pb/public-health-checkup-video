"""字幕时间轴：文字按剧本台词改正，时间先取自转写，再用音量包络对齐到真正开口/收声的时刻。

输出 src/captions.ts，每个片段一组 {from, to, text}（单位：秒，相对片段开头）。
用法：python3 scripts/captions.py
"""
import json
import subprocess
from pathlib import Path

import numpy as np

# 片段名 → (视频文件, 片段在原视频里的起点秒数, 片段时长秒数, [(转写起, 转写止, 字幕文字)])
SEGMENTS = {
    "SEG01": ("SEG01", 0, 13, [(2.50, 4.62, "四块二，零头抹了。"), (4.62, 7.54, "周哥……就两毛钱！")]),
    "SEG02": ("SEG02", 0, 15, [
        (0.00, 1.76, "千万不要去体检！"), (1.76, 3.52, "没病都给你查出病来！"),
        (5.56, 8.72, "我妈一辈子没体检，活到八十八！"),
        (8.96, 11.9, "就是！我吃得香、睡得好，查啥？"), (11.9, 14.2, "这账，不划算。")]),
    "SEG03": ("SEG03", 0, 15, [(2.38, 3.66, "又省一笔。")]),
    "SEG04": ("SEG04", 0, 15, [
        (1.26, 3.56, "周会计，三十年了，"), (3.56, 6.40, "我陪你没算错过一分钱。"),
        (6.40, 9.10, "今天这笔——你算错了。"), (9.10, 11.42, "我？算错？我可是铁算！"), (12.44, 13.48, "那就对账。")]),
    "SEG05": ("SEG05", 0, 15, [
        (0.00, 2.16, "请假扣钱、挂号费、检查费——"), (2.16, 2.62, "亏！"),
        (2.62, 5.18, "单位体检，单位掏钱；"), (5.18, 8.12, "过了六十五，社区每年免费查一次。"),
        (8.12, 11.24, "那老刘他妈不体检，照样活到八十八！"), (11.24, 14.70, "拿别人中的彩票，当自己的工资算？")]),
    "SEG06": ("SEG06", 0, 15, [(0.00, 3.20, "小病拖成大病，这边才是大头。"), (11.98, 14.40, "懂了！体检划算！")]),
    "SEG07": ("SEG07", 0, 14.5, [(0.00, 2.74, "一次查个够，省得以后跑！"), (4.32, 8.56, "停停停！你这是来体检，还是来进货？！")]),
    "SEG08": ("SEG08", 0, 12.5, [
        (2.78, 3.60, "抽烟吗？"), (5.54, 7.14, "三十年，一天一包。"), (7.14, 8.76, "家里谁有高血压？"), (9.34, 9.96, "我爸。")]),
    "SEG09": ("SEG09v2", 0, 15, [
        (0.00, 2.34, "血压、血糖、血脂，这是基本盘；"), (2.34, 5.26, "你抽烟三十年，加个低剂量螺旋 CT。"),
        (5.26, 8.28, "全身 PET-CT？没症状，不用做。"), (8.80, 10.46, "这才叫会算账——"),
        (10.46, 14.76, "该花的花，不该花的，一分不花。")]),
    "SEG10a": ("SEG10", 0, 202 / 24, [(0.00, 1.42, "可我没时间啊！"), (2.16, 4.88, "请半天假，全勤奖没了，"), (4.88, 6.28, "孙子谁接？")]),
    "SEG10b": ("SEG10", 202 / 24, 139 / 24, [(12.40, 13.64, "……上午就上午。")]),
    "SEG13": ("SEG13", 0, 15, [(10.26, 12.14, "你不是说体检是收割吗？！"), (12.14, 14.86, "我……我来看看它怎么收割的。")]),
    "SEG14": ("SEG14", 0, 14, [(2.10, 3.38, "周哥也来啦！"), (9.74, 11.38, "早知道就一上午，"), (11.38, 12.86, "我去年就来了。")]),
    "SEG15": ("SEG15", 0, 15, [
        (3.10, 4.32, "完了完了完了……"), (4.32, 7.60, "慌啥！这叫赶上了。"),
        (7.60, 10.58, "健康账跟钱一样会滚利息："), (10.58, 12.92, "现在管，还本金；"), (12.92, 14.84, "拖着，利滚利。")]),
    "SEG16": ("SEG16", 0, 15, [
        (0.00, 3.46, "问题不大。少油少盐，每天多走走，"), (3.46, 5.12, "三个月后来复查。"),
        (5.12, 6.50, "还有，烟——"), (6.50, 6.84, "戒！"), (7.50, 10.52, "一天一包，一年下来……")]),
    "SEG17a": ("SEG17", 0, 97 / 24, [(1.10, 4.04, "三笔账，全算明白了！")]),
    "SEG17b": ("SEG17", 116 / 24, 246 / 24, [(7.62, 9.86, "查完往抽屉一扔？"), (9.86, 12.88, "这账就白算了！")]),
    "SEG18": ("SEG18", 0, 15, [
        (0.00, 2.02, "周哥，今天还砍两毛？"), (2.14, 2.44, "砍！"),
        (9.50, 11.68, "钱、时间、健康——"), (11.68, 14.84, "这三笔账，早算早划算。")]),
}

HOP = 0.01  # 10ms 一个能量点


def envelope(clip):
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", f"public/seedance/{clip}.mp4", "-vn", "-ac", "1", "-ar", "16000", "-f", "s16le", "-"],
        capture_output=True,
    ).stdout
    x = np.frombuffer(raw, np.int16).astype(float) / 32768
    n = int(16000 * HOP)
    frames = x[: len(x) // n * n].reshape(-1, n)
    db = 20 * np.log10(np.sqrt((frames**2).mean(axis=1)) + 1e-6)
    return db


def snap(db, start, end, nxt):
    thr = max(np.percentile(db, 30) + 10, -38)
    voiced = db > thr
    i0, i1 = int(max(0, start - 0.35) / HOP), int(min(len(db) * HOP, start + 0.4) / HOP)
    on = next((i for i in range(i0, i1) if voiced[i : i + 5].all()), int(start / HOP))
    j = int(max(on * HOP + 0.3, end - 0.3) / HOP)
    while j < len(db) - 20 and voiced[j : j + 20].any() and j * HOP < nxt:
        j += 1
    return on * HOP, min(j * HOP + 0.15, nxt)


out = {}
cache = {}
for name, (clip, offset, length, lines) in SEGMENTS.items():
    db = cache.setdefault(clip, envelope(clip))
    res = []
    for k, (s, e, text) in enumerate(lines):
        nxt = lines[k + 1][0] if k + 1 < len(lines) else offset + length
        a, b = snap(db, s, e, nxt)
        a, b = max(a - offset, 0), min(b - offset, length)
        b = max(b, a + 0.7)  # 字幕至少停 0.7 秒，短句（"砍！""戒！"）也来得及看
        res.append({"from": round(a, 2), "to": round(min(b, length), 2), "text": text})
    for k in range(len(res) - 1):  # 不重叠
        res[k]["to"] = min(res[k]["to"], res[k + 1]["from"])
    out[name] = res

lines = ["// 由 scripts/captions.py 生成：文字按剧本改正，时间对齐到实际开口/收声（秒，相对片段开头）。", "export const CAPTIONS = {"]
for name, res in out.items():
    lines.append(f"  {name}: [")
    lines += [f'    {{ from: {r["from"]}, to: {r["to"]}, text: {json.dumps(r["text"], ensure_ascii=False)} }},' for r in res]
    lines.append("  ],")
lines.append("} as const;\n")
Path("src/captions.ts").write_text("\n".join(lines))
for name, res in out.items():
    print(name, [(r["from"], r["to"], r["text"][:6]) for r in res])
