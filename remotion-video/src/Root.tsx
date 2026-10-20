import "./fonts";
import { Composition, Folder } from "remotion";
import { Main } from "./Main";
import { DataCard } from "./scenes/DataCard";
import { EndCard } from "./scenes/EndCard";
import { IntroCaption } from "./scenes/IntroCaption";
import { LedgerChapter } from "./scenes/LedgerChapter";
import { LedgerIntro } from "./scenes/LedgerIntro";
import { MoneyLedgerOverlay } from "./scenes/MoneyLedgerOverlay";
import { FakeEnding, PhoneNotice, ReminderSet } from "./scenes/PhoneOverlays";
import { ScienceFormula } from "./scenes/ScienceFormula";
import { ListInsert, PhoneShopInsert } from "./scenes/Seg07Inserts";
import { SegPlaceholder } from "./scenes/SegPlaceholder";
import { TimeSplit } from "./scenes/TimeSplit";
import { TitleCard } from "./scenes/TitleCard";

// 全片 1920×1080、24fps（与 Seedance 帧率一致）。
// Main 的时长 = 各段之和 − 各转场重叠 = 6443 帧 ≈ 268.5s（用 scripts/duration.py 重新计算）。
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ZhouTieSuan"
        component={Main}
        durationInFrames={6443}
        fps={24}
        width={1920}
        height={1080}
      />
      <Folder name="Cards">
        <Composition
          id="R01-IntroCaption"
          component={IntroCaption}
          durationInFrames={190}
          fps={24}
          width={1920}
          height={1080}
          defaultProps={{ still: "ref/SEG01_freeze.jpg" }}
        />
        <Composition
          id="R02-TitleCard"
          component={TitleCard}
          durationInFrames={72}
          fps={24}
          width={1920}
          height={1080}
          defaultProps={{
            title: "周铁算的三笔账",
            subtitle: "主动体检，科学体检",
          }}
        />
        <Composition
          id="R05-LedgerIntro"
          component={LedgerIntro}
          durationInFrames={72}
          fps={24}
          width={1920}
          height={1080}
        />
        <Composition
          id="R05-LedgerChapter"
          component={LedgerChapter}
          durationInFrames={60}
          fps={24}
          width={1920}
          height={1080}
          defaultProps={{
            color: "#3E8FD1",
            spine: "#2B6498",
            book: "时间账",
            chapter: "第二笔 · 时间账",
          }}
        />
        <Composition
          id="R09-ScienceFormula"
          component={ScienceFormula}
          durationInFrames={72}
          fps={24}
          width={1920}
          height={1080}
        />
        <Composition
          id="R10-TimeSplit"
          component={TimeSplit}
          durationInFrames={288}
          fps={24}
          width={1920}
          height={1080}
          defaultProps={{ variant: "seedance" }}
        />
        <Composition
          id="R13-DataCard"
          component={DataCard}
          durationInFrames={96}
          fps={24}
          width={1920}
          height={1080}
          defaultProps={{
            percent: 18.2,
            headline: "血脂异常的人里，\n不到两成知道自己有这个问题",
            source:
              "数据来源：Xia Q, et al. 2023（中国成人血脂异常知晓率 18.2%）",
          }}
        />
        <Composition
          id="R16-EndCard"
          component={EndCard}
          durationInFrames={192}
          fps={24}
          width={1920}
          height={1080}
          defaultProps={{
            line1: "45 岁起，给自己建一份健康“底账”",
            line2: "按自己的风险选项目，问问家庭医生",
            line3: "报告上有箭头，3 个月内去复查",
            credit:
              "公共卫生传播学22级 第3大组第4小组　　使用工具：image2.5 seedance2.0 remotion",
            music: "音乐：Kevin MacLeod（incompetech.com），CC BY 4.0",
          }}
        />
        <Composition
          id="R06-MoneyLedgerOverlay"
          component={MoneyLedgerOverlay}
          durationInFrames={360}
          fps={24}
          width={1920}
          height={1080}
        />
        <Composition
          id="R07-PhoneShop"
          component={PhoneShopInsert}
          durationInFrames={41}
          fps={24}
          width={1920}
          height={1080}
        />
        <Composition
          id="R08-ListInsert"
          component={ListInsert}
          durationInFrames={82}
          fps={24}
          width={1920}
          height={1080}
          defaultProps={{ hitItem: "妇科彩超" }}
        />
        <Composition
          id="PhoneNotice"
          component={PhoneNotice}
          durationInFrames={53}
          fps={24}
          width={1920}
          height={1080}
        />
        <Composition
          id="R14-FakeEnding"
          component={FakeEnding}
          durationInFrames={90}
          fps={24}
          width={1920}
          height={1080}
          defaultProps={{ still: "ref/SEG17_freeze.jpg" }}
        />
        <Composition
          id="R15-ReminderSet"
          component={ReminderSet}
          durationInFrames={49}
          fps={24}
          width={1920}
          height={1080}
        />
        <Composition
          id="SegPlaceholder"
          component={SegPlaceholder}
          durationInFrames={240}
          fps={24}
          width={1920}
          height={1080}
          defaultProps={{
            seg: "SEG01",
            title: "菜市场砍两毛",
            note: "三块八，零头抹了 → 大姐认输 → 老周得意定格",
            accent: "#C08A3E",
            style: { backgroundColor: "#F4E9D8" },
          }}
        />
      </Folder>
    </>
  );
};
