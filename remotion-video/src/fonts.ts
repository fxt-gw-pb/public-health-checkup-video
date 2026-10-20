// 全片只用两套字体：站酷快乐体（标题、花字）+ 思源黑体（正文、字幕）。
// 在这里加载一次，组件里直接写字体名字符串，保证 Studio 能编辑样式。
import { loadFont as loadKuaiLe } from "@remotion/google-fonts/ZCOOLKuaiLe";
import { loadFont as loadNotoSansSC } from "@remotion/google-fonts/NotoSansSC";

loadKuaiLe("normal", {
  weights: ["400"],
  subsets: ["chinese-simplified", "latin"],
  ignoreTooManyRequestsWarning: true,
});
loadNotoSansSC("normal", {
  weights: ["400", "700", "900"],
  subsets: ["chinese-simplified", "latin"],
  ignoreTooManyRequestsWarning: true,
});
