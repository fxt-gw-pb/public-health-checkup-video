import { Audio, Video } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { staticFile, useVideoConfig } from "remotion";
import { CAPTIONS } from "./captions";
import { beadWipe } from "./components/BeadWipe";
import { SoundTrack } from "./components/SoundTrack";
import { Subtitles } from "./components/Subtitles";
import {
  doorsIn,
  doorsOut,
  pageTurn,
  paperIn,
  paperOut,
  whipPan,
  zoomThrough,
} from "./components/transitions";
import { DataCard } from "./scenes/DataCard";
import { EndCard } from "./scenes/EndCard";
import { IntroCaption } from "./scenes/IntroCaption";
import { LedgerChapter } from "./scenes/LedgerChapter";
import { LedgerIntro } from "./scenes/LedgerIntro";
import { MoneyLedgerOverlay } from "./scenes/MoneyLedgerOverlay";
import { FakeEnding, PhoneNotice, ReminderSet } from "./scenes/PhoneOverlays";
import { ScienceFormula } from "./scenes/ScienceFormula";
import { ListInsert, PhoneShopInsert } from "./scenes/Seg07Inserts";
import { TimeSplit } from "./scenes/TimeSplit";
import { TitleCard } from "./scenes/TitleCard";

// 成片时间线，顺序与 提示词管理/02_seedance/00_分段总表.md 第 1 节一致。
// 衔接规则：
//   视频 → 字卡：paperIn（字卡像一页账簿翻上来）；字卡 → 视频：paperOut（被掀走）
//   换场景：beadWipe（算珠扫过，全片招牌）；镜头冲进账簿：zoomThrough；分屏：doorsIn / doorsOut
//   同一场景的连续镜头：硬切，或很短的交叉淡化
// public/seedance/ 里的视频都已转成 24fps 恒定帧率（scripts/prep-clip.sh），避免快动作处卡顿闪烁。
export const Main = () => {
  const { fps } = useVideoConfig();
  const card = linearTiming({ durationInFrames: 14 });
  const wipe = linearTiming({ durationInFrames: fps });
  const zoom = linearTiming({ durationInFrames: 12 });
  const doors = linearTiming({ durationInFrames: 14 });

  return (
    <>
      <TransitionSeries name="成片">
        {/* ── 冷开场 ── */}
        <TransitionSeries.Sequence
          name="SEG01 菜市场砍两毛"
          durationInFrames={13 * fps}
        >
          <Video
            name="SEG01 视频"
            src={staticFile("seedance/SEG01.mp4")}
            style={{ width: "100%", height: "100%" }}
          />
          <Subtitles cues={CAPTIONS.SEG01} />
        </TransitionSeries.Sequence>
        {/* SEG01 剪到 13.0 秒：路人那句“周铁算，又赢了”13.35 秒才开口，整句剪掉，改由旁白来读。定格的就是这最后一帧，硬切过去画面连续 */}
        <TransitionSeries.Sequence name="R01 人物介绍" durationInFrames={190}>
          <IntroCaption still="ref/SEG01_freeze.jpg" />
          <Audio
            name="旁白：人物介绍（微软 Yunxi）"
            src={staticFile("audio/narration_R01.mp3")}
          />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={paperIn()} timing={card} />
        <TransitionSeries.Sequence
          name="R02 片名卡"
          durationInFrames={3.5 * fps}
        >
          <TitleCard title="周铁算的三笔账" subtitle="主动体检，科学体检" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={paperOut()} timing={card} />
        <TransitionSeries.Sequence
          name="SEG02 公园不划算"
          durationInFrames={15 * fps}
        >
          <Video
            name="SEG02 视频"
            src={staticFile("seedance/SEG02.mp4")}
            style={{ width: "100%", height: "100%" }}
          />
          <PhoneNotice
            name="手机弹窗：体检预约提醒"
            from={122}
            durationInFrames={53}
          />
          <Subtitles cues={CAPTIONS.SEG02} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={beadWipe()} timing={wipe} />

        {/* ── 算盘醒了 ── */}
        <TransitionSeries.Sequence
          name="SEG03 夜·抽屉·算盘醒来"
          durationInFrames={15 * fps}
        >
          <Video
            name="SEG03 视频"
            src={staticFile("seedance/SEG03.mp4")}
            style={{ width: "100%", height: "100%" }}
          />
          <Subtitles cues={CAPTIONS.SEG03} />
        </TransitionSeries.Sequence>
        {/* 算盘爷站在五斗柜上 → 老周已经缩在沙发上：甩镜头，像镜头"唰"地转向老周 */}
        <TransitionSeries.Transition
          presentation={whipPan()}
          timing={linearTiming({ durationInFrames: 10 })}
        />
        <TransitionSeries.Sequence
          name="SEG04 你算错了"
          durationInFrames={15 * fps}
        >
          <Video
            name="SEG04 视频"
            src={staticFile("seedance/SEG04.mp4")}
            style={{ width: "100%", height: "100%" }}
          />
          <Subtitles cues={CAPTIONS.SEG04} />
        </TransitionSeries.Sequence>
        {/* SEG04 结尾推到算珠特写 → 这一页像账簿一样翻过去，露出三本账簿 */}
        <TransitionSeries.Transition
          presentation={pageTurn()}
          timing={linearTiming({ durationInFrames: 20 })}
        />
        <TransitionSeries.Sequence name="R05-1 三本账簿" durationInFrames={77}>
          <LedgerIntro />
        </TransitionSeries.Sequence>
        {/* 金色账簿翻开 → 冲进账簿空间 */}
        <TransitionSeries.Transition
          presentation={zoomThrough()}
          timing={zoom}
        />

        {/* ── 第一笔：金钱账 ── */}
        <TransitionSeries.Sequence
          name="SEG05 单位掏钱"
          durationInFrames={15 * fps}
        >
          <Video
            name="SEG05 视频"
            src={staticFile("seedance/SEG05.mp4")}
            style={{ width: "100%", height: "100%" }}
          />
          <MoneyLedgerOverlay name="R06 体检/不查 + 亏" />
          <Subtitles cues={CAPTIONS.SEG05} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence
          name="SEG06 缴费单雪崩"
          durationInFrames={15 * fps}
        >
          <Video
            name="SEG06 视频"
            src={staticFile("seedance/SEG06.mp4")}
            style={{ width: "100%", height: "100%" }}
          />
          <Subtitles cues={CAPTIONS.SEG06} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={beadWipe()} timing={wipe} />
        <TransitionSeries.Sequence
          name="SEG07 豪华套餐进货"
          durationInFrames={14.5 * fps}
        >
          <Video
            name="SEG07 视频"
            src={staticFile("seedance/SEG07.mp4")}
            style={{ width: "100%", height: "100%" }}
          />
          <PhoneShopInsert
            name="R07 套餐购物页"
            from={70}
            durationInFrames={41}
          />
          <ListInsert
            name="R08 清单特写"
            from={8 * fps}
            durationInFrames={82}
            hitItem="妇科彩超"
          />
          <Subtitles cues={CAPTIONS.SEG07} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={beadWipe()} timing={wipe} />
        {/* SEG08 台词 10 秒说完，后面是无声的写字特写；剪到 12.5 秒，再柔和地化进 SEG09 的同一个特写 */}
        <TransitionSeries.Sequence
          name="SEG08 诊室问诊"
          durationInFrames={12.5 * fps}
        >
          <Video
            name="SEG08 视频"
            src={staticFile("seedance/SEG08.mp4")}
            style={{ width: "100%", height: "100%" }}
          />
          <Subtitles cues={CAPTIONS.SEG08} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 10 })}
        />
        <TransitionSeries.Sequence
          name="SEG09 医生划清单"
          durationInFrames={15 * fps}
        >
          {/* v2 在 3.58–5.63s 老周脸上有白色方块（重新生成也有）：画面剪成三段依次接上，
            白框那段换成 v1 同时段的医生写字特写；声音单独一条，全程用 v2 原声，台词不断 */}
          <Audio
            name="SEG09 原声（v2）"
            src={staticFile("seedance/SEG09v2.mp4")}
          />
          <Video
            name="SEG09 画面① v2"
            src={staticFile("seedance/SEG09v2.mp4")}
            durationInFrames={66}
            muted
            style={{ width: "100%", height: "100%" }}
          />
          <Video
            name="SEG09 画面② v1 医生特写"
            src={staticFile("seedance/SEG09.mp4")}
            from={66}
            durationInFrames={72}
            trimBefore={66}
            muted
            style={{ width: "100%", height: "100%" }}
          />
          <Video
            name="SEG09 画面③ v2"
            src={staticFile("seedance/SEG09v2.mp4")}
            from={138}
            trimBefore={138}
            muted
            style={{ width: "100%", height: "100%" }}
          />
          <Subtitles cues={CAPTIONS.SEG09} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={paperIn()} timing={card} />
        <TransitionSeries.Sequence
          name="R09 科学体检字卡"
          durationInFrames={3 * fps}
        >
          <ScienceFormula />
        </TransitionSeries.Sequence>

        {/* ── 第二笔：时间账 ── */}
        <TransitionSeries.Transition
          presentation={paperIn()}
          timing={linearTiming({ durationInFrames: 12 })}
        />
        <TransitionSeries.Sequence name="R05-2 时间账" durationInFrames={62}>
          <LedgerChapter
            color="#3E8FD1"
            spine="#2B6498"
            book="时间账"
            chapter="第二笔 · 时间账"
          />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={paperOut()} timing={card} />
        <TransitionSeries.Sequence
          name="SEG10 没时间（镜头1–2）"
          durationInFrames={202}
        >
          <Video
            name="SEG10 视频（前半）"
            src={staticFile("seedance/SEG10.mp4")}
            style={{ width: "100%", height: "100%" }}
          />
          <Subtitles cues={CAPTIONS.SEG10a} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={doorsIn()} timing={doors} />
        <TransitionSeries.Sequence
          name="R10 时间账分屏"
          durationInFrames={12 * fps}
        >
          <TimeSplit variant="seedance" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={doorsOut()} timing={doors} />
        <TransitionSeries.Sequence
          name="SEG10 上午就上午（镜头3）"
          durationInFrames={139}
        >
          <Video
            name="SEG10 视频（后半）"
            src={staticFile("seedance/SEG10.mp4")}
            trimBefore={202}
            style={{ width: "100%", height: "100%" }}
          />
          <Subtitles cues={CAPTIONS.SEG10b} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={beadWipe()} timing={wipe} />
        <TransitionSeries.Sequence
          name="SEG13 墨镜相遇"
          durationInFrames={15 * fps}
        >
          <Video
            name="SEG13 视频"
            src={staticFile("seedance/SEG13.mp4")}
            style={{ width: "100%", height: "100%" }}
          />
          <Subtitles cues={CAPTIONS.SEG13} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence
          name="SEG14 广场舞队·早点摊"
          durationInFrames={14 * fps}
        >
          <Video
            name="SEG14 视频"
            src={staticFile("seedance/SEG14.mp4")}
            style={{ width: "100%", height: "100%" }}
          />
          <Subtitles cues={CAPTIONS.SEG14} />
        </TransitionSeries.Sequence>

        {/* ── 第三笔：健康账 ── */}
        <TransitionSeries.Transition presentation={paperIn()} timing={card} />
        <TransitionSeries.Sequence name="R05-3 健康账" durationInFrames={62}>
          <LedgerChapter
            color="#3FA66A"
            spine="#2C7A4D"
            book="健康账"
            chapter="第三笔 · 健康账"
          />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={paperOut()} timing={card} />
        <TransitionSeries.Sequence
          name="SEG15 报告恐慌·利滚利"
          durationInFrames={15 * fps}
        >
          <Video
            name="SEG15 视频"
            src={staticFile("seedance/SEG15.mp4")}
            style={{ width: "100%", height: "100%" }}
          />
          <Subtitles cues={CAPTIONS.SEG15} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={paperIn()} timing={card} />
        <TransitionSeries.Sequence
          name="R13 血脂数据卡"
          durationInFrames={3.5 * fps}
        >
          <DataCard
            percent={18.2}
            headline={"血脂异常的人里，\n不到两成知道自己有这个问题"}
            source="数据来源：Xia Q, et al. 2023（中国成人血脂异常知晓率 18.2%）"
          />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={paperOut()} timing={card} />
        <TransitionSeries.Sequence
          name="SEG16 诊室复查·戒烟"
          durationInFrames={15 * fps}
        >
          <Video
            name="SEG16 视频"
            src={staticFile("seedance/SEG16.mp4")}
            style={{ width: "100%", height: "100%" }}
          />
          <Subtitles cues={CAPTIONS.SEG16} />
        </TransitionSeries.Sequence>
        {/* SEG17 拆成三段：伸懒腰（说完"全算明白了"）→ 定格假片尾 → 跳过原片 4.05–4.85s 的叠化，直接接抽屉 */}
        <TransitionSeries.Sequence name="SEG17 伸懒腰" durationInFrames={97}>
          <Video
            name="SEG17 视频（前）"
            src={staticFile("seedance/SEG17.mp4")}
            style={{ width: "100%", height: "100%" }}
          />
          <Subtitles cues={CAPTIONS.SEG17a} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="R14 假片尾" durationInFrames={90}>
          <FakeEnding still="ref/SEG17_freeze.jpg" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence
          name="SEG17 抽屉·设提醒"
          durationInFrames={246}
        >
          <Video
            name="SEG17 视频（后）"
            src={staticFile("seedance/SEG17.mp4")}
            trimBefore={116}
            style={{ width: "100%", height: "100%" }}
          />
          <ReminderSet
            name="R15 复查提醒气泡"
            from={197}
            durationInFrames={49}
          />
          <Subtitles cues={CAPTIONS.SEG17b} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={beadWipe()} timing={wipe} />

        {/* ── 尾声 ── */}
        <TransitionSeries.Sequence
          name="SEG18 尾声菜市场"
          durationInFrames={15 * fps}
        >
          <Video
            name="SEG18 视频"
            src={staticFile("seedance/SEG18.mp4")}
            style={{ width: "100%", height: "100%" }}
          />
          <Subtitles cues={CAPTIONS.SEG18} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={paperIn()} timing={card} />
        <TransitionSeries.Sequence
          name="R16 片尾行动卡"
          durationInFrames={8 * fps}
        >
          <EndCard
            line1="45 岁起，给自己建一份健康“底账”"
            line2="按自己的风险选项目，问问家庭医生"
            line3="报告上有箭头，3 个月内去复查"
            credit="公共卫生传播学22级 第3大组第4小组　　使用工具：image2.5 seedance2.0 remotion"
            music="音乐：Kevin MacLeod（incompetech.com）Fluffing a Duck / Sneaky Snitch / Monkeys Spinning Monkeys / Carefree / Investigations，CC BY 4.0"
          />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      <SoundTrack />
    </>
  );
};
