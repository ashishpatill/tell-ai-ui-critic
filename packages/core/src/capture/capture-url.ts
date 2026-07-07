import { chromium } from "playwright";
import { CapturePayload } from "@tell/schema";

const SAMPLE_SELECTORS = [
  "body",
  "h1",
  "h2",
  "h3",
  "h4",
  "p",
  "li",
  "button",
  "a",
  "input",
  "select",
  "textarea",
  "nav",
  "header",
  "footer",
  "main",
  "section",
  "article",
  "[class*='card']",
  "[class*='panel']",
  "[class*='tile']",
  "[class*='feature']",
  "[class*='btn']",
  "[class*='button']",
  "[class*='cta']",
  "[class*='hero']",
  "[class*='tag']",
  "[class*='mini']",
].join(",");

const MAX_INLINE_CSS = 400_000;
const MAX_SNAPSHOT = 2_600_000;

export async function captureUrl(url: string): Promise<CapturePayload> {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
    // `networkidle` is defeated by a dev server's HMR websocket, so navigate on DOM-ready and then
    // actively wait for real content to hydrate. This makes capturing a freshly-booted localhost dev
    // server (the GitHub-repo-setup flow) reliable, while still working on static/production pages.
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20_000 });
    await page.waitForLoadState("networkidle", { timeout: 4_000 }).catch(() => {});
    await page
      .waitForFunction(() => document.querySelectorAll("h1,h2,article,section,main [class*='card'],button,nav a,.tag").length >= 3, undefined, { timeout: 6_000 })
      .catch(() => {});
    await page.waitForTimeout(350); // let webfonts + late paints settle
    const screenshotBase64 = await page.screenshot({ fullPage: true, type: "png" }).then((b) => b.toString("base64"));

    const payload = await page.evaluate(
      ([selector, maxInlineCss, maxSnapshot]) => {
        // NOTE: no named inner functions here — esbuild/tsx would wrap them in a
        // `__name` helper that does not exist inside the serialized browser scope.
        // Stamp a unique data-tell-id on each sampled element on the LIVE dom (before we clone
        // the tree for the snapshot), classify its rendered role, and record its box. The redesign
        // engine then restyles THIS exact element via [data-tell-id="…"] — no selector guessing.
        const samples = Array.from(document.querySelectorAll<HTMLElement>(selector)).slice(0, 320).map((el, i) => {
          const cs = getComputedStyle(el);
          const tellId = "t" + i;
          el.setAttribute("data-tell-id", tellId);
          const tag = el.tagName.toLowerCase();
          const cls = (typeof el.className === "string" ? el.className : "").toLowerCase();
          const fs = parseFloat(cs.fontSize) || 16;
          const txt = (el.textContent || "").trim();
          const wordCount = txt ? txt.split(/\s+/).length : 0;
          const r = el.getBoundingClientRect();
          const interactive = tag === "button" || tag === "a" || tag === "input" || tag === "select" || tag === "textarea";
          // Inline role classification (no named fns allowed in this browser scope).
          let role = "other";
          if (tag === "button" || (tag === "a" && /(^|[^a-z])(btn|button|cta|primary|action)([^a-z]|$)/.test(cls))) role = "button";
          else if (tag === "input" || tag === "select" || tag === "textarea") role = "input";
          else if (tag === "nav") role = "nav";
          else if (tag === "a") role = "link";
          else if (tag === "h1" || fs >= 34) role = "display";
          else if (tag === "h2" || tag === "h3" || tag === "h4" || fs >= 22) role = "heading";
          else if (/(card|panel|tile|feature)/.test(cls)) role = "card";
          else if (tag === "section" || tag === "article" || tag === "header" || tag === "footer" || tag === "main" || /(hero|section|container|wrap)/.test(cls)) role = "surface";
          else if (tag === "p" || tag === "li" || (wordCount >= 3 && !interactive)) role = "body";
          return {
            selector: el.id ? "#" + el.id : cls ? tag + "." + cls.split(" ")[0] : tag,
            tellId,
            tag,
            role,
            rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
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
        // :hover / :focus rules from same-origin stylesheets. While we walk the
        // sheets we also (a) inline every readable rule for the snapshot and
        // (b) harvest CSS custom properties declared on :root/html/body.
        const hoverSelectors: string[] = [];
        const focusSelectors: string[] = [];
        let inlinedCss = "";
        const cssVariables: { name: string; value: string }[] = [];
        const seenVar = new Set<string>();
        for (const sheet of Array.from(document.styleSheets)) {
          let rules: CSSRuleList | null = null;
          try { rules = sheet.cssRules; } catch { continue; } // cross-origin sheet
          if (!rules) continue;
          for (const rule of Array.from(rules)) {
            if (inlinedCss.length < maxInlineCss) {
              try { inlinedCss += (rule as CSSRule).cssText + "\n"; } catch { /* skip */ }
            }
            const sr = rule as CSSStyleRule;
            const sel = sr.selectorText;
            if (!sel) continue;
            if (/(^|,)\s*(:root|html|body)\s*(,|$)/.test(sel) && sr.style) {
              for (let i = 0; i < sr.style.length; i++) {
                const name = sr.style[i];
                if (name && name.startsWith("--")) {
                  const value = sr.style.getPropertyValue(name).trim();
                  const key = `${name}:${value}`;
                  if (value && !seenVar.has(key)) { seenVar.add(key); cssVariables.push({ name, value }); }
                }
              }
            }
            if (/:hover\b/.test(sel)) {
              hoverSelectors.push(...sel.split(",").map((s) => s.replace(/:hover\b/g, "").trim() || "*"));
            }
            if (/:focus(-visible)?\b/.test(sel)) {
              const outline = `${sr.style?.getPropertyValue("outline")} ${sr.style?.getPropertyValue("outline-style")}`;
              const shadow = sr.style?.getPropertyValue("box-shadow");
              const suppresses = /\b(none|0px|0)\b/.test(outline) && !shadow;
              if (!suppresses) focusSelectors.push(...sel.split(",").map((s) => s.replace(/:focus(-visible)?\b/g, "").trim() || "*"));
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

        // ── Real surface tokens (sampled from the DOM, not assumed) ──────
        const CLEAR = ["", "transparent", "rgba(0, 0, 0, 0)"];
        const bodyCs = getComputedStyle(document.body);
        let bodyBg = bodyCs.backgroundColor;
        if (CLEAR.includes(bodyBg)) {
          const htmlBg = getComputedStyle(document.documentElement).backgroundColor;
          bodyBg = CLEAR.includes(htmlBg) ? "rgb(255, 255, 255)" : htmlBg;
        }
        const heading = document.querySelector<HTMLElement>("h1,h2,h3,[class*='hero'] h1,[class*='hero'] h2");
        const interactive = Array.from(
          document.querySelectorAll<HTMLElement>("button,a[href],[class*='btn'],[class*='button'],[type='submit'],[class*='cta'],[class*='primary']"),
        ).slice(0, 140);
        const accentCounts = new Map<string, number>();
        for (const el of interactive) {
          const cs = getComputedStyle(el);
          for (const val of [cs.backgroundColor, cs.color, cs.borderColor]) {
            if (CLEAR.includes(val)) continue;
            const m = val.match(/\d+(?:\.\d+)?/g);
            let sat = 0;
            if (m && m.length >= 3) {
              const rn = +m[0]! / 255, gn = +m[1]! / 255, bn = +m[2]! / 255;
              const mx = Math.max(rn, gn, bn), mn = Math.min(rn, gn, bn);
              const ll = (mx + mn) / 2;
              sat = mx === mn ? 0 : ll > 0.5 ? (mx - mn) / (2 - mx - mn) : (mx - mn) / (mx + mn);
            }
            if (sat > 0.22) accentCounts.set(val, (accentCounts.get(val) ?? 0) + 1);
          }
        }
        let accent = "";
        let max = 0;
        for (const [value, count] of accentCounts) if (count > max) { max = count; accent = value; }
        const accentSources = Array.from(accentCounts.keys()).slice(0, 8);
        const radiusEl = document.querySelector<HTMLElement>("button,[class*='btn'],[class*='card'],[class*='button']");
        const radius = radiusEl ? getComputedStyle(radiusEl).borderRadius : "0px";
        const shadow =
          Array.from(document.querySelectorAll<HTMLElement>("[class*='card'],[class*='panel'],button,section,article"))
            .map((e) => getComputedStyle(e).boxShadow)
            .find((s) => s && s !== "none") ?? "none";

        const bodyFam = bodyCs.fontFamily || "";
        const bodyFont = (bodyFam.split(",")[0] || "").replace(/["']/g, "").trim() || "unknown";
        const headFam = heading ? getComputedStyle(heading).fontFamily : bodyFam;
        const headingFont = (headFam.split(",")[0] || "").replace(/["']/g, "").trim() || bodyFont;

        const surfaceTokens = {
          bodyBg,
          bodyText: bodyCs.color,
          bodyFont,
          headingFont,
          accent: accent || bodyCs.color,
          accentSources,
          radius,
          shadow,
        };

        // ── Re-renderable snapshot: strip scripts, inline same-origin CSS, base href ──
        const clone = document.documentElement.cloneNode(true) as HTMLElement;
        clone
          .querySelectorAll("script,link[as='script'],link[rel='modulepreload'],link[rel='preload'][as='script'],meta[http-equiv='Content-Security-Policy' i],meta[http-equiv='content-security-policy' i]")
          .forEach((n) => n.remove());
        clone.querySelectorAll<HTMLElement>("*").forEach((el) => {
          for (const attr of Array.from(el.attributes)) if (attr.name.startsWith("on")) el.removeAttribute(attr.name);
        });
        let head = clone.querySelector("head");
        if (!head) { head = document.createElement("head"); clone.insertBefore(head, clone.firstChild); }
        const base = document.createElement("base");
        base.setAttribute("href", document.location.href);
        head.insertBefore(base, head.firstChild);
        if (inlinedCss) {
          const style = document.createElement("style");
          style.setAttribute("data-tell-inlined", "");
          style.textContent = inlinedCss;
          head.appendChild(style);
        }
        const snapshotHtml = (`<!DOCTYPE html>${clone.outerHTML}`).slice(0, maxSnapshot);

        return {
          snapshotHtml,
          cssVariables,
          surfaceTokens,
          styles: samples,
          probes,
          domSummary: {
            headingCount: document.querySelectorAll("h1,h2,h3").length,
            buttonCount: document.querySelectorAll("button").length,
            centeredBlockRatio: blocks.length ? centered / blocks.length : 0,
            emojiInUiCount,
          },
        };
      },
      [SAMPLE_SELECTORS, MAX_INLINE_CSS, MAX_SNAPSHOT] as const,
    );

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
