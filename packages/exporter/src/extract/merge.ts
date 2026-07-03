import type { ElementHandle } from "playwright";
import type { HtpManifest, MarkerConfig } from "@htp/core";

/**
 * 按节点 merge 策略临时隐藏已标记子孙节点，并在回调结束后恢复。
 */
export async function withMergeHiddenDescendants<T>(
  el: ElementHandle,
  marker: MarkerConfig,
  manifest: HtpManifest | null,
  callback: () => Promise<T>,
): Promise<T> {
  await hideMergeDescendants(el, marker, manifest);
  try {
    return await callback();
  } finally {
    await restoreMergeDescendants(el);
  }
}

async function hideMergeDescendants(
  el: ElementHandle,
  marker: MarkerConfig,
  manifest: HtpManifest | null,
): Promise<void> {
  await el.evaluate(
    (root, { typeAttr, mergeAttr, nodes }) => {
      const markedTypes = new Set(["text", "table", "image"]);
      const getMerge = (target: Element): string => {
        const attrMerge = target.getAttribute(mergeAttr);
        if (attrMerge) return attrMerge;
        const matched = nodes.find((node) => document.querySelector(node.selector) === target);
        return matched?.merge || "auto";
      };

      const rootMerge = getMerge(root);
      if (rootMerge === "all") return;

      root.querySelectorAll(`[${typeAttr}]`).forEach((child) => {
        const childType = child.getAttribute(typeAttr);
        if (!childType || !markedTypes.has(childType)) return;
        if (rootMerge === "text" && childType !== "image") return;

        const htmlChild = child as HTMLElement;
        htmlChild.dataset.htpMergePrevVisibility = htmlChild.style.visibility;
        htmlChild.dataset.htpMergeHidden = "1";
        htmlChild.style.visibility = "hidden";
      });
    },
    {
      typeAttr: marker.typeAttr,
      mergeAttr: marker.mergeAttr,
      nodes: manifest?.nodes ?? [],
    },
  );
}

async function restoreMergeDescendants(el: ElementHandle): Promise<void> {
  await el.evaluate((root) => {
    root.querySelectorAll("[data-htp-merge-hidden='1']").forEach((child) => {
      const htmlChild = child as HTMLElement;
      htmlChild.style.visibility = htmlChild.dataset.htpMergePrevVisibility ?? "";
      delete htmlChild.dataset.htpMergePrevVisibility;
      delete htmlChild.dataset.htpMergeHidden;
    });
  });
}
