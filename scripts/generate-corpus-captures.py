#!/usr/bin/env python3
"""Generate slim synthetic CapturePayload fixtures for the open corpus."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "fixtures" / "corpus" / "captures"

# 1x1 transparent PNG
TINY_PNG = (
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
)


def style(
    selector: str,
    *,
    font: str,
    size: str,
    weight: str,
    color: str,
    bg: str,
    radius: str = "0px",
    shadow: str = "none",
    padding: str = "16px",
    align: str = "left",
    role: str = "other",
    tell_id: str = "",
    tag: str = "div",
    bg_image: str = "none",
    rect: dict | None = None,
) -> dict:
    return {
        "selector": selector,
        "tellId": tell_id or selector.replace(".", "").replace("#", "")[:12],
        "tag": tag,
        "role": role,
        "rect": rect or {"x": 0, "y": 0, "w": 400, "h": 48},
        "fontFamily": font,
        "fontSize": size,
        "fontWeight": weight,
        "color": color,
        "backgroundColor": bg,
        "borderRadius": radius,
        "boxShadow": shadow,
        "padding": padding,
        "textAlign": align,
        "lineHeight": "1.5",
        "backgroundImage": bg_image,
    }


def probe(role: str, selector: str, hover: bool, focus: bool, disabled: bool = False) -> dict:
    return {
        "role": role,
        "selector": selector,
        "hasHoverDiff": hover,
        "hasFocusVisibleDiff": focus,
        "hasDisabledAttr": disabled,
        "ariaDisabled": False,
    }


def capture(
    *,
    url: str,
    styles: list[dict],
    probes: list[dict],
    dom: dict,
    css_vars: list[dict] | None = None,
) -> dict:
    return {
        "url": url,
        "capturedAt": "2026-07-17T00:00:00.000Z",
        "viewport": {"width": 1440, "height": 1100},
        "screenshotBase64": TINY_PNG,
        "snapshotHtml": f"<html><body data-tell-corpus=\"1\"><p>{url}</p></body></html>",
        "cssVariables": css_vars or [],
        "styles": styles,
        "probes": probes,
        "stateShots": [],
        "viewportMatrix": [],
        "domSummary": dom,
    }


def editorial_calm() -> dict:
    """Serif editorial surface — should fire few/no genericness tells."""
    font = '"Fraunces", "Georgia", serif'
    body = '"Source Serif 4", Georgia, serif'
    ink = "rgb(28, 25, 23)"
    paper = "rgb(250, 247, 242)"
    accent = "rgb(180, 83, 49)"
    styles = [
        style("body", font=body, size="17px", weight="400", color=ink, bg=paper, role="surface", tag="body", padding="0px"),
        style("h1", font=font, size="56px", weight="600", color=ink, bg="rgba(0, 0, 0, 0)", role="display", tag="h1", padding="0px", rect={"x": 80, "y": 120, "w": 720, "h": 80}),
        style("h2", font=font, size="32px", weight="600", color=ink, bg="rgba(0, 0, 0, 0)", role="heading", tag="h2", padding="0px"),
        style("p", font=body, size="17px", weight="400", color="rgb(68, 64, 60)", bg="rgba(0, 0, 0, 0)", role="body", tag="p", padding="0px"),
        style("button.primary", font=body, size="15px", weight="600", color="rgb(255, 255, 255)", bg=accent, radius="10px", role="button", tag="button", padding="12px 20px"),
        style("a", font=body, size="15px", weight="500", color=accent, bg="rgba(0, 0, 0, 0)", role="link", tag="a", padding="0px"),
        style("nav", font=body, size="14px", weight="500", color=ink, bg=paper, role="nav", tag="nav", padding="16px 24px"),
        style("article.card", font=body, size="16px", weight="400", color=ink, bg="rgb(255, 252, 247)", radius="12px", shadow="rgba(0, 0, 0, 0.06) 0px 1px 2px", role="card", tag="article", padding="24px"),
        style("section", font=body, size="16px", weight="400", color=ink, bg=paper, role="surface", tag="section", padding="64px 24px", align="left"),
    ]
    # Add a few more varied sizes/spaces so spacing/type detectors stay calm
    for i, (sz, pad) in enumerate([(14, "8px"), (15, "12px"), (18, "24px"), (20, "32px"), (24, "48px")]):
        styles.append(
            style(
                f".meta-{i}",
                font=body,
                size=f"{sz}px",
                weight="400",
                color="rgb(87, 83, 78)",
                bg="rgba(0, 0, 0, 0)",
                padding=pad,
                role="body",
                tag="span",
            )
        )
    probes = [
        probe("button", "button.primary", True, True),
        probe("a", "nav a", True, True),
        probe("a", "a", True, True),
        probe("button", "button.secondary", True, True, True),
    ]
    return capture(
        url="corpus://editorial-calm",
        styles=styles,
        probes=probes,
        dom={"headingCount": 4, "buttonCount": 2, "centeredBlockRatio": 0.15, "emojiInUiCount": 0},
        css_vars=[
            {"name": "--color-ink", "value": "#1C1917", "source": ":root"},
            {"name": "--color-paper", "value": "#FAF7F2", "source": ":root"},
            {"name": "--color-accent", "value": "#B45331", "source": ":root"},
        ],
    )


def fintech_dense() -> dict:
    """Dense Inter fintech dashboard — spacing chaos + gray mush + system font."""
    font = "Inter, system-ui, sans-serif"
    ink = "rgb(15, 23, 42)"
    paper = "rgb(248, 250, 252)"
    # Near-duplicate grays (ΔL small)
    grays = [
        "rgb(241, 245, 249)",
        "rgb(243, 244, 246)",
        "rgb(244, 244, 245)",
        "rgb(245, 245, 245)",
        "rgb(246, 246, 247)",
        "rgb(242, 242, 243)",
    ]
    styles = [
        style("body", font=font, size="14px", weight="400", color=ink, bg=paper, role="surface", tag="body", padding="0px"),
        style("h1", font=font, size="28px", weight="700", color=ink, bg="rgba(0, 0, 0, 0)", role="display", tag="h1", padding="0px"),
        style("h2", font=font, size="19px", weight="600", color=ink, bg="rgba(0, 0, 0, 0)", role="heading", tag="h2", padding="0px"),
        style("h3", font=font, size="15px", weight="600", color=ink, bg="rgba(0, 0, 0, 0)", role="heading", tag="h3", padding="0px"),
        style("button.primary", font=font, size="13px", weight="600", color="rgb(255, 255, 255)", bg="rgb(37, 99, 235)", radius="6px", role="button", tag="button", padding="9px 14px"),
        style("button.ghost", font=font, size="13px", weight="500", color=ink, bg="rgb(255, 255, 255)", radius="6px", role="button", tag="button", padding="9px 14px"),
        style("input", font=font, size="13px", weight="400", color=ink, bg="rgb(255, 255, 255)", radius="4px", role="input", tag="input", padding="7px 11px"),
        style("nav", font=font, size="13px", weight="500", color=ink, bg="rgb(255, 255, 255)", role="nav", tag="nav", padding="13px 17px"),
        style("a", font=font, size="13px", weight="500", color="rgb(37, 99, 235)", bg="rgba(0, 0, 0, 0)", role="link", tag="a", padding="0px"),
    ]
    # Many off-grid paddings → SpacingChaos / TokenBypass
    odd_pads = ["11px", "13px", "17px", "19px", "21px", "23px", "27px", "29px", "31px", "33px", "37px", "41px"]
    for i, (gray, pad) in enumerate(zip(grays * 2, odd_pads)):
        styles.append(
            style(
                f".panel-{i}",
                font=font,
                size=f"{13 + (i % 5)}px",
                weight="400",
                color=ink if i % 2 == 0 else "rgb(100, 116, 139)",
                bg=gray,
                radius="6px",
                shadow="none",
                padding=pad,
                role="card",
                tag="div",
            )
        )
    # Extra odd type sizes for TypeScaleDrift
    for i, sz in enumerate([11, 13, 15, 17, 19, 21, 23, 25, 27, 29]):
        styles.append(
            style(
                f".metric-{i}",
                font=font,
                size=f"{sz}px",
                weight="600",
                color=ink,
                bg="rgba(0, 0, 0, 0)",
                padding=f"{7 + i}px",
                role="body",
                tag="span",
            )
        )
    probes = [
        probe("button", "button.primary", True, False),  # missing focus
        probe("button", "button.ghost", False, False),
        probe("a", "nav a", True, False),
        probe("input", "input", False, True),
        probe("button", "button.disabled", False, False, True),
    ]
    return capture(
        url="corpus://fintech-dense",
        styles=styles,
        probes=probes,
        dom={"headingCount": 8, "buttonCount": 6, "centeredBlockRatio": 0.2, "emojiInUiCount": 0},
    )


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    fixtures = {
        "editorial-calm.json": editorial_calm(),
        "fintech-dense.json": fintech_dense(),
    }
    for name, payload in fixtures.items():
        path = OUT / name
        path.write_text(json.dumps(payload, indent=2) + "\n")
        print(f"wrote {path.relative_to(ROOT)} ({len(payload['styles'])} styles)")


if __name__ == "__main__":
    main()
