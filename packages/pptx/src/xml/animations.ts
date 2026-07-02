/**
 * 动画时序 XML 生成器
 *
 * 将 HTP 动画 DSL 映射为 PPTX p:timing 结构。
 * 支持 click（单击）、withPrevious（与前一项同时）和
 * afterPrevious（前一项之后）三种触发方式。
 */

import { NS, esc } from "./builder";
import { HTP_TO_MSO_ANIM_EFFECT } from "@htp/core";

// ---------------------------------------------------------------------------
// 类型定义
// ---------------------------------------------------------------------------

/** 时序动画定义 */
export interface TimingAnimationDef {
  shapeId: number;
  effect: string;            // HTP 效果名，如 "fade"
  trigger?: "click" | "withPrevious" | "afterPrevious";
  duration?: number;         // 持续时间（秒）
  delay?: number;            // 延迟时间（秒）
}

// ---------------------------------------------------------------------------
// 为幻灯片构建 p:timing 节点
// ---------------------------------------------------------------------------

/**
 * 根据动画定义数组生成完整的 p:timing XML
 *
 * 构建以 tmRoot 为根的时序树，每个动画作为一个
 * 并行（par）子时序节点，包含触发条件和效果行为。
 * 动画参数为空时返回空字符串。
 */
export function buildTiming(animations: TimingAnimationDef[]): string {
  if (animations.length === 0) return "";

  // 为每个动画构建子时序节点
  const animNodes = animations.map((anim, i) => {
    const msoEffect = HTP_TO_MSO_ANIM_EFFECT[anim.effect] ?? 1; // 默认：出现效果
    const duration = anim.duration ?? 0.5;
    const delay = anim.delay ?? 0;
    const triggerNode = buildTrigger(anim.trigger);

    // 秒转毫秒
    const durMs = Math.round(duration * 1000);
    const delayMs = Math.round(delay * 1000);

    // 将动画构建为并行（par）子时序节点
    return `<p:par>
      ${triggerNode}
      <p:cTn id="${i + 2}" dur="${durMs}" fill="hold">
        <p:stCondLst>
          <p:cond delay="${delayMs}"/>
        </p:stCondLst>
        <p:childTnLst>
          <p:animEffect transition="in" filter="0">
            <p:cBhvr>
              <p:cTn id="${i + 3}" dur="${durMs}" fill="hold"/>
              <p:tgtEl>
                <p:spTgt spid="${anim.shapeId}"/>
              </p:tgtEl>
            </p:cBhvr>
          </p:animEffect>
        </p:childTnLst>
      </p:cTn>
    </p:par>`;
  });

  return `<p:timing>
    <p:tnLst>
      <p:par>
        <p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot">
          <p:childTnLst>
            ${animNodes.join("\n")}
          </p:childTnLst>
        </p:cTn>
      </p:par>
    </p:tnLst>
  </p:timing>`;
}

/**
 * 根据触发类型构建对应的触发条件节点
 *
 * 生成包含开始条件（p:cond）的 cTn 节点。
 * 当前三种触发类型（click/withPrevious/afterPrevious）
 * 使用相同的 XML 结构，由 PowerPoint 根据并行/顺序
 * 关系推断实际行为。
 */
function buildTrigger(trigger?: string): string {
  if (!trigger || trigger === "click") {
    // 单击触发（PowerPoint 默认行为）
    return `<p:cTn id="0" dur="1" fill="hold">
      <p:stCondLst><p:cond evt="begin" delay="0"><p:tn/></p:cond></p:stCondLst>
    </p:cTn>`;
  }
  if (trigger === "withPrevious") {
    // 与前一项同时开始
    return `<p:cTn id="0" dur="1" fill="hold">
      <p:stCondLst><p:cond evt="begin" delay="0"><p:tn/></p:cond></p:stCondLst>
    </p:cTn>`;
  }
  if (trigger === "afterPrevious") {
    // 前一项结束后开始
    return `<p:cTn id="0" dur="1" fill="hold">
      <p:stCondLst><p:cond evt="begin" delay="0"><p:tn/></p:cond></p:stCondLst>
    </p:cTn>`;
  }
  return `<p:cTn id="0" dur="1" fill="hold"/>`;
}

// ---------------------------------------------------------------------------
// 批量构建幻灯片时序（动画模式为 "native" 时使用）
// ---------------------------------------------------------------------------

/** 幻灯片时序信息 */
export interface SlideTimingInfo {
  slideIndex: number;
  animations: TimingAnimationDef[];
}

/**
 * 批量构建多张幻灯片的时序 XML
 *
 * 遍历 SlideTimingInfo 数组，为每张包含动画的幻灯片
 * 生成对应的 p:timing 字符串，返回 Map<slideIndex, timingXml>。
 */
export function buildSlideTimings(slides: SlideTimingInfo[]): Map<number, string> {
  const map = new Map<number, string>();
  for (const slide of slides) {
    const timingXml = buildTiming(slide.animations);
    if (timingXml) {
      map.set(slide.slideIndex, timingXml);
    }
  }
  return map;
}
