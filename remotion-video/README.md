# 《周铁算的三笔账》Remotion 工程

全片合成工程：1920×1080，24fps。规格见 `../提示词管理/03_remotion/00_动画清单.md`。

## 预览

```bash
npm i          # 第一次
npm run dev    # 打开 Remotion Studio：http://localhost:3000
```

- **ZhouTieSuan**：成片时间线（约 4 分 06 秒）。还没生成的 Seedance 段落显示为斜条纹占位块，标着段落编号和内容。
- **Cards** 文件夹：每张字卡单独预览、单独调整。

## 结构

```
src/
├── Root.tsx          所有 Composition 的注册
├── Main.tsx          成片时间线（顺序 = 分段总表第 1 节）
├── fonts.ts          站酷快乐体 + 思源黑体
├── components/       2D 平涂基础元素：账簿纸、算珠、账簿、算珠转场
└── scenes/           R01 人物介绍 · R02 片名 · R05 账簿章节 · R09 科学体检
                      R10 时间账分屏 · R13 数据卡 · R16 片尾 · SEG 占位块
public/
├── ref/              参考图（角色设定图等）
└── seedance/         放 Seedance 视频（SEG01.mp4 …），到位后替换占位块
```

## 素材接入

Seedance 段落选定后，把视频复制到 `public/seedance/SEGxx.mp4`，再把 `Main.tsx` 里对应的 `<SegPlaceholder>` 换成 `<Video>`（由 Claude 操作，同时按"可用时长"裁剪）。
