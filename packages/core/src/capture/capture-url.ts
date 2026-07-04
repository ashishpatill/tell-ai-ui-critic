import { chromium } from "playwright";
import { CapturePayload } from "@tell/schema";

const SAMPLE_SELECTORS = [
  "body",
  "h1",
  "h2",
  "h3",
  "button",
  "a",
  "input",
  "nav",
  "[class*='card']",
  "[class*='hero']",
].join(",");

export async function captureUrl(url: string): Promise<CapturePayload> {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
    await page.goto(url, { waitUntil: "networkidle", timeout: 10_000 });
    const screenshotBase64 = await page.screenshot({ fullPage: true, type: "png" }).then((b) => b.toString("base64"));

    const payload = await page.evaluate((selector) => {
      const samples = Array.from(document.querySelectorAll<HTMLElement>(selector)).slice(0, 200).map((el) => {
        const cs = getComputedStyle(el);
        const selectorLabel =
          el.id ? `#${el.id}` : el.className ? `${el.tagName.toLowerCase()}.${String(el.className).split(" ")[0]}` : el.tagName.toLowerCase();
        return {
          selector: selectorLabel,
          fontFamily: cs.fontFamily,
          fontSize: cs.fontSize,
          fontWeight: cs.fontWeight,
          color: cs.color,
          backgroundColor: cs.backgroundColor,
          borderRadius: cs.borderRadius,
          boxShadow: cs.boxShadow,
          padding: cs.padding,
          textAlign: cs.textAlign,
          lineHeight: cs.lineHeight,
          backgroundImage: cs.backgroundImage,
        };
      });

      // Rendered-truth interactive state: collect base selectors that carry
      // :hover / :focus rules from same-origin stylesheets (works for plain CSS
      // and utility classes alike). A :focus rule that only suppresses the ring
      // (outline:none, no shadow) does NOT count as a visible focus style.
      const hoverSelectors: string[] = [];
      const focusSelectors: string[] = [];
      for (const sheet of Array.from(document.styleSheets)) {
        let rules: CSSRuleList | null = null;
        try { rules = sheet.cssRules; } catch { continue; } // cross-origin sheet
        if (!rules) continue;
        for (const rule of Array.from(rules)) {
          const sr = rule as CSSStyleRule;
          const sel = sr.selectorText;
          if (!sel) continue;
          if (/:hover\b/.test(sel)) {
            hoverSelectors.push(...sel.split(",").map((s) => s.replace(/:hover\b/g, "").trim()).filter(Boolean));
          }
          if (/:focus(-visible)?\b/.test(sel)) {
            const outline = `${sr.style?.getPropertyValue("outline")} ${sr.style?.getPropertyValue("outline-style")}`;
            const shadow = sr.style?.getPropertyValue("box-shadow");
            const suppresses = /\b(none|0px|0)\b/.test(outline) && !shadow;
            if (!suppresses) focusSelectors.push(...sel.split(",").map((s) => s.replace(/:focus(-visible)?\b/g, "").trim()).filter(Boolean));
          }
        }
      }

      const probes = Array.from(document.querySelectorAll<HTMLElement>("button,a[href],input,select")).slice(0, 80).map((el, index) => ({
        role: el.getAttribute("role") ?? el.tagName.toLowerCase(),
        selector: el.id ? `#${el.id}` : `${el.tagName.toLowerCase()}:nth-of-type(${index + 1})`,
        hasHoverDiff: hoverSelectors.some((s) => { try { return el.matches(s); } catch { return false; } }),
        hasFocusVisibleDiff: focusSelectors.some((s) => { try { return el.matches(s); } catch { return false; } }),
        hasDisabledAttr: el.hasAttribute("disabled"),
        ariaDisabled: el.getAttribute("aria-disabled") === "true",
      }));

      // Emoji only in UI chrome (headings, buttons, nav, links) — not body prose.
      const chrome = Array.from(document.querySelectorAll<HTMLElement>("h1,h2,h3,button,nav,nav a,a"));
      const emojiRe = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu;
      const emojiInUiCount = chrome.reduce((n, el) => n + ((el.textContent?.match(emojiRe) ?? []).length), 0);

      // Centered ratio over text-bearing blocks, not every div on the page.
      const blocks = Array.from(document.querySelectorAll<HTMLElement>("section,header,footer,article,main,div")).filter((el) =>
        Array.from(el.childNodes).some((n) => n.nodeType === 3 && (n.textContent ?? "").trim().length > 0),
      );
      const centered = blocks.filter((el) => getComputedStyle(el).textAlign === "center").length;

      return {
        styles: samples,
        probes,
        domSummary: {
          headingCount: document.querySelectorAll("h1,h2,h3").length,
          buttonCount: document.querySelectorAll("button").length,
          centeredBlockRatio: blocks.length ? centered / blocks.length : 0,
          emojiInUiCount,
        },
      };
    }, SAMPLE_SELECTORS);

    return CapturePayload.parse({
      url,
      capturedAt: new Date().toISOString(),
      viewport: { width: 1440, height: 1100 },
      screenshotBase64,
      ...payload,
    });
  } finally {
    await browser.close();
  }
}
