"""Seedance 2.0 批量提交与收片（通过即梦 CLI）。

用法（在项目根目录运行）：
  python3 提示词管理/tools/seedance.py submit SEG05 SEG08   # 提交，记录 submit_id
  python3 提示词管理/tools/seedance.py poll                 # 查询所有未完成任务，成功的下载成 SEGxx_vN.mp4
  python3 提示词管理/tools/seedance.py credit               # 查积分
  python3 提示词管理/tools/seedance.py webpack SEG05        # 给网页平台准备提交包（素材/_网页提交包/SEG05/）

素材顺序来自 02_seedance/提交清单.json，提示词来自各 SEG 文件“## 提示词”下的代码块。
上传前统一转成 JPEG 副本（素材/_上传缓存/），避免大图上传超时。
"""
import json
import re
import subprocess
import sys
import tempfile
import time
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
ASSETS = ROOT / "素材"
CACHE = ASSETS / "_上传缓存"
OUT = ASSETS / "05_seedance视频"
LOG_MD = OUT / "生成记录.md"
LOG_JSON = OUT / "submissions.json"
MANIFEST = ROOT / "提示词管理" / "02_seedance" / "提交清单.json"
SEG_DIR = ROOT / "提示词管理" / "02_seedance"
CLI_ARGS = ["--model_version=seedance2.0_vip", "--duration=15", "--ratio=16:9", "--video_resolution=720p"]


def run_cli(args, timeout=900):
    p = subprocess.run(["dreamina", *args], capture_output=True, text=True, timeout=timeout)
    text = p.stdout.strip()
    start = text.find("{")
    try:
        return json.loads(text[start:]) if start >= 0 else {"raw": text, "stderr": p.stderr}
    except json.JSONDecodeError:
        return {"raw": text, "stderr": p.stderr}


def credit():
    return run_cli(["user_credit"], timeout=90).get("total_credit")


def load_log():
    return json.loads(LOG_JSON.read_text()) if LOG_JSON.exists() else []


def save_log(rows):
    LOG_JSON.write_text(json.dumps(rows, ensure_ascii=False, indent=2))


def md_row(*cells):
    with LOG_MD.open("a") as f:
        f.write("| " + " | ".join(str(c) for c in cells) + " |\n")


def upload_copy(rel):
    src = ASSETS / rel
    if src.suffix.lower() == ".wav":
        return src
    dst = CACHE / (src.stem + ".jpg")
    if not dst.exists() or dst.stat().st_mtime < src.stat().st_mtime:
        CACHE.mkdir(exist_ok=True)
        Image.open(src).convert("RGB").save(dst, "JPEG", quality=93, optimize=True)
    return dst


def prompt_for(seg, audio_map):
    md = next(SEG_DIR.glob(f"{seg}_*.md")).read_text()
    prompt = re.search(r"## 提示词\s*```\n(.*?)\n```", md, re.S).group(1).strip()
    # 去掉引用了缺失音频的分句，并把剩下的 @音频 编号重排成实际上传顺序
    parts = re.split(r"(?<=[，。；])", prompt)
    kept = []
    for part in parts:
        refs = [int(n) for n in re.findall(r"@音频(\d)", part)]
        if any(n not in audio_map for n in refs):
            continue
        kept.append(re.sub(r"@音频(\d)", lambda m: f"@音频{audio_map[int(m.group(1))]}", part))
    return "".join(kept)


def submit(segs):
    manifest = json.loads(MANIFEST.read_text())
    rows = load_log()
    for seg in segs:
        spec = manifest[seg]
        missing = [i for i in spec["images"] if not (ASSETS / i).exists()]
        if missing:
            print(f"{seg}: 缺少图片，跳过 → {missing}")
            continue
        present = [(n + 1, a) for n, a in enumerate(spec["audios"]) if (ASSETS / a).exists()]
        audio_map = {old: new + 1 for new, (old, _) in enumerate(present)}
        args = ["multimodal2video"]
        for i in spec["images"]:
            args += ["--image", str(upload_copy(i))]
        for _, a in present:
            args += ["--audio", str(upload_copy(a))]
        args += ["--prompt", prompt_for(seg, audio_map), *CLI_ARGS, "--poll=0"]
        before = credit()
        for attempt in range(4):
            res = run_cli(args)
            reason = res.get("fail_reason", "")
            # 上传阶段的网络超时不会扣积分，等一会儿重试
            transient = any(k in reason for k in ("deadline exceeded", "EOF", "connection reset", "upload resource"))
            if not transient and "timeout" not in reason.lower():
                break
            print(f"{seg}: 上传时网络出错，{20 * (attempt + 1)} 秒后重试（第 {attempt + 2} 次）")
            time.sleep(20 * (attempt + 1))
        sid, status = res.get("submit_id", "—"), res.get("gen_status", "?")
        print(f"{seg}: submit_id={sid} status={status} {reason}")
        rows.append({"seg": seg, "submit_id": sid, "status": status, "reason": reason,
                     "credit_before": before, "audios": [a for _, a in present],
                     "time": time.strftime("%Y-%m-%d %H:%M")})
        save_log(rows)
        if status == "fail" and "ExceedConcurrencyLimit" not in reason:
            md_row(time.strftime("%m-%d %H:%M"), seg, "CLI", sid, f"失败：{reason[:60]}", f"{before}→", "—", "")


def webpack(segs):
    """给网页平台准备提交包：按上传顺序编号的图片/音频 + 可直接粘贴的提示词。"""
    manifest = json.loads(MANIFEST.read_text())
    base = ASSETS / "_网页提交包"
    for seg in segs:
        spec = manifest[seg]
        missing = [i for i in spec["images"] if not (ASSETS / i).exists()]
        if missing:
            print(f"{seg}: 缺少图片，暂不打包 → {missing}")
            continue
        d = base / seg
        if d.exists():
            for f in d.iterdir():
                f.unlink()
        d.mkdir(parents=True, exist_ok=True)
        for n, i in enumerate(spec["images"], 1):
            src = upload_copy(i)
            (d / f"图片{n}_{src.name}").write_bytes(src.read_bytes())
        present = [(n + 1, a) for n, a in enumerate(spec["audios"]) if (ASSETS / a).exists()]
        audio_map = {old: new + 1 for new, (old, _) in enumerate(present)}
        for new, (_, a) in enumerate(present, 1):
            (d / f"音频{new}_{Path(a).name}").write_bytes((ASSETS / a).read_bytes())
        (d / "提示词.txt").write_text(prompt_for(seg, audio_map))
        print(f"{seg}: {len(spec['images'])} 张图、{len(present)} 段音频 → {d.relative_to(ROOT)}")


def next_version(seg):
    vs = [int(m.group(1)) for p in OUT.glob(f"{seg}_v*.mp4") if (m := re.search(r"_v(\d+)\.mp4$", p.name))]
    return max(vs, default=0) + 1


def poll():
    rows = load_log()
    for r in rows:
        if r["status"] not in ("querying", "?") or r["submit_id"] == "—":
            continue
        with tempfile.TemporaryDirectory() as tmp:
            res = run_cli(["query_result", f"--submit_id={r['submit_id']}", f"--download_dir={tmp}"])
            r["status"] = res.get("gen_status", r["status"])
            if r["status"] == "success":
                vids = sorted(Path(tmp).rglob("*.mp4"))
                if not vids:
                    r["status"] = "querying"
                    continue
                dst = OUT / f"{r['seg']}_v{next_version(r['seg'])}.mp4"
                vids[0].rename(dst)
                r["file"] = dst.name
                after = credit()
                r["credit_after"] = after
                md_row(time.strftime("%m-%d %H:%M"), r["seg"], "CLI", r["submit_id"], "成功",
                       f"{r['credit_before']}→{after}", f"`{dst.name}`", "")
            elif r["status"] == "fail":
                r["reason"] = res.get("fail_reason", "")
                md_row(time.strftime("%m-%d %H:%M"), r["seg"], "CLI", r["submit_id"],
                       f"失败：{r['reason'][:60]}", f"{r['credit_before']}→", "—", "")
        print(f"{r['seg']}: {r['status']} {r.get('file', '')} {r.get('reason', '')}")
    save_log(rows)


if __name__ == "__main__":
    cmd, *rest = sys.argv[1:] or ["poll"]
    {"submit": lambda: submit(rest), "poll": poll, "credit": lambda: print(credit()),
     "webpack": lambda: webpack(rest)}[cmd]()
