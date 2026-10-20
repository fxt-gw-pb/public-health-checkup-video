"""按依赖顺序串行生成（即梦账号同时只能跑一个任务）。

  python3 提示词管理/tools/queue_run.py SEG04 SEG05 SEG06 ...

每段：提交（并发已满就等）→ 轮询到结束 → 下载为 SEGxx_vN.mp4 → 跑后处理钩子
（抽尾帧给下一段当首帧、截参考音频）。每完成一段打印一行 DONE/FAIL，方便监控。
"""
import json
import subprocess
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import seedance as sd  # noqa: E402

ASR_PY = "/private/tmp/claude-501/-Users-fpb-26-autumn-------/86613194-9d2b-4096-863a-f83149bdc3f4/scratchpad/asr-venv/bin/python"
TAILS = sd.ASSETS / "06_尾帧抽取"
VOICES = sd.ASSETS / "07_音频参考"

# 生成完需要抽尾帧的段落（下一段用它当首帧，或尾声对齐开场）
NEED_TAIL = {"SEG01", "SEG05", "SEG08", "SEG13"}
# 生成完截参考音频：段落 → (文件名, 台词里能认出说话人的关键词)
# 段落 → (文件名, 说话人台词的关键词, 必须排除的其他角色台词关键词)
NEED_VOICE = {"SEG04": ("A-算盘爷.wav", ["周会计", "你算错"], ["我算错", "铁算"]),
              "SEG08": ("A-李医生.wav", ["抽烟", "高血压"], ["三十年", "一包", "我爸"])}


def say(msg):
    print(time.strftime("%H:%M:%S"), msg, flush=True)


def extract_tail(seg, video):
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0",
                                str(video)], capture_output=True, text=True).stdout)
    out = TAILS / f"{seg}_尾帧.png"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{dur - 0.1:.2f}", "-i", str(video), "-frames:v", "1",
                    str(out)], check=True)
    say(f"  尾帧 → {out.name}")


def extract_voice(seg, video, name, keys, exclude):
    code = (
        "import mlx_whisper, json, sys\n"
        f"r = mlx_whisper.transcribe({str(video)!r}, path_or_hf_repo='mlx-community/whisper-large-v3-turbo', language='zh')\n"
        "print(json.dumps([[s['start'], s['end'], s['text']] for s in r['segments']], ensure_ascii=False))\n")
    p = subprocess.run([ASR_PY, "-I", "-c", code], capture_output=True, text=True)
    segs = json.loads(p.stdout.strip().splitlines()[-1])
    hits = [(a, b, t) for a, b, t in segs if any(k in t for k in keys) and not any(x in t for x in exclude)]
    say(f"  转写：{segs}")
    if not hits:
        say(f"  ⚠️ 没找到 {name} 的台词，跳过截取")
        return
    parts = []
    for n, (a, b, _) in enumerate(hits):
        part = VOICES / f"_tmp_{n}.wav"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{max(0, a - 0.05):.2f}", "-to", f"{b + 0.1:.2f}",
                        "-i", str(video), "-vn", "-ac", "1", "-ar", "44100", str(part)], check=True)
        parts.append(part)
    lst = VOICES / "_tmp_list.txt"
    lst.write_text("".join(f"file '{p}'\n" for p in parts))
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(lst), "-c", "copy",
                    str(VOICES / name)], check=True)
    for p in parts + [lst]:
        p.unlink()
    # Seedance 要求参考音频至少 2 秒，台词太短就在末尾补静音
    out = VOICES / name
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0",
                                str(out)], capture_output=True, text=True).stdout)
    if dur < 2.5:
        padded = VOICES / f"_pad_{name}"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(out), "-af", "apad=whole_dur=2.5", str(padded)],
                       check=True)
        padded.replace(out)
    say(f"  参考音频 → {name}（{', '.join(t for _, _, t in hits)}）")


def post_process(row):
    seg, video = row["seg"], sd.OUT / row["file"]
    if seg in NEED_TAIL:
        extract_tail(seg, video)
    if seg in NEED_VOICE:
        extract_voice(seg, video, *NEED_VOICE[seg])


def settle():
    """等账号上所有在跑的任务结束；每个成功任务只做一次后处理。"""
    while True:
        rows = sd.load_log()
        for r in rows:
            if r["status"] == "success" and not r.get("post_done"):
                say(f"DONE {r['seg']} → {r['file']}")
                post_process(r)
                r["post_done"] = True
                sd.save_log(rows)
            elif r["status"] == "fail" and r.get("submit_id") != "—" and not r.get("post_done") and r.get("credit_before") and "ExceedConcurrency" not in r.get("reason", ""):
                say(f"FAIL {r['seg']} 生成失败：{r.get('reason', '')}")
                r["post_done"] = True
                sd.save_log(rows)
        if not any(r["status"] == "querying" for r in rows):
            return
        time.sleep(30)
        sd.poll()


def run_one(seg):
    settle()
    for _ in range(30):
        sd.submit([seg])
        rows = sd.load_log()
        last = rows[-1]
        if last["status"] == "querying":
            say(f"{seg}: 已提交 {last['submit_id']}，提交前积分 {last['credit_before']}")
            settle()
            return
        last["post_done"] = True
        sd.save_log(rows)
        if "ExceedConcurrencyLimit" in last.get("reason", ""):
            time.sleep(60)
            continue
        say(f"FAIL {seg} 提交失败：{last.get('reason', '')}")
        return
    say(f"FAIL {seg} 等了 30 分钟仍然并发已满")


if __name__ == "__main__":
    for seg in sys.argv[1:]:
        run_one(seg)
    settle()
    say(f"QUEUE FINISHED，剩余积分 {sd.credit()}")
