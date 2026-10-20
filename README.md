# 《周铁算的三笔账》——主动体检，科学体检

公共卫生传播课程作业（公共卫生传播学 22 级 第 3 大组第 4 小组）。一部约 4 分半钟的 2D 卡通科普短片，面向 45–74 岁人群，用"健康、时间、金钱三笔账"讲清楚为什么要**主动体检、科学体检**，以及查出问题后要按时复查。

**成片**：[`导出/周铁算的三笔账_v2_压缩版.mp4`](导出/)（1080p，约 4 分 28 秒）

> 一句话梗概：最会算账的人，偏偏算错了人生最大的一笔账。

## 制作方式

| 工具 | 负责 |
|---|---|
| ChatGPT image 2.5 | 角色设定图、场景图、每段首帧、抠图素材 |
| Seedance 2.0（即梦 CLI + 网页） | 18 段角色表演动画，每段 15 秒 |
| Remotion | 字卡、数据卡、转场、分屏、字幕、音效与配乐、最终合成 |
| Claude Code | 剧本、提示词管理、批量生成与质检、Remotion 工程 |

## 目录

```
剧本/                 剧本 v1（分镜、台词、理论依据对照表）
提示词管理/           全部提示词与生成流程
  ├── 00_全局设定/      风格圣经、角色卡、场景与道具（唯一定义）
  ├── 01_image2.5/     角色、场景、首帧、抠图的出图提示词
  ├── 02_seedance/     18 段视频提示词、分段总表、提交清单
  ├── 03_remotion/     动画清单
  ├── 04_音频/         配音、音乐、音效设计
  ├── tools/           即梦 CLI 批量提交 / 排队生成脚本
  └── 05_进度表.md
素材/                 生成结果：角色图、场景图、首帧、Seedance 视频、参考音频
remotion-video/       Remotion 工程（成片合成）
导出/                 成片
```

## 本地预览与导出

```bash
cd remotion-video
npm i
npm run dev                                  # 打开 Remotion Studio：http://localhost:3000
npx remotion render ZhouTieSuan out/成片.mp4   # 导出 1080p 成片
```

时间线改动后依次运行 `scripts/duration.py`（总时长）→ `scripts/captions.py`（字幕）→ `scripts/sound.py`（音乐与音效时间点）。新的 Seedance 视频放进工程前先用 `scripts/prep-clip.sh` 转成 24fps。

## 署名与授权

- **背景音乐**：Kevin MacLeod（[incompetech.com](https://incompetech.com)）——Fluffing a Duck、Sneaky Snitch、Monkeys Spinning Monkeys、Carefree、Investigations，按 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 使用。
- **音效**：部分来自 Remotion 提供的音效库（remotion.media），算盘、书本落地、盖章、弹出等为程序合成。
- **旁白**：人物介绍旁白由微软 Edge TTS（zh-CN-YunxiNeural）生成；开场"四块二"一句用 F5-TTS 以角色原声克隆生成。
- **数据**：血脂异常知晓率 18.2% 引自 Xia Q, et al. 2023；其余政策与流行病学数据见课程作业报告。
- **Remotion** 遵循其自身的 [许可协议](https://www.remotion.dev/license)。

课程研究背景资料（含组员信息与引用截图）未包含在本仓库中。
