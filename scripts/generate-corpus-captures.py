#!/usr/bin/env python3
"""Generate slim synthetic CapturePayload fixtures for the open corpus + scenario matrix."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "fixtures" / "corpus" / "captures"
MATRIX_OUT = ROOT / "fixtures" / "corpus" / "scenario-matrix.json"

# 1x1 transparent PNG
TINY_PNG = (
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
)
TINY_PNG_ALT = (
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
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
    viewport: dict | None = None,
    viewport_matrix: list[dict] | None = None,
    screenshot: str = TINY_PNG,
) -> dict:
    return {
        "url": url,
        "capturedAt": "2026-07-19T00:00:00.000Z",
        "viewport": viewport or {"width": 1440, "height": 1100},
        "screenshotBase64": screenshot,
        "snapshotHtml": f'<html><body data-tell-corpus="1"><p>{url}</p></body></html>',
        "cssVariables": css_vars or [],
        "styles": styles,
        "probes": probes,
        "stateShots": [],
        "viewportMatrix": viewport_matrix or [],
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
            {"name": "--color-ink", "value": "#1C1917"},
            {"name": "--color-paper", "value": "#FAF7F2"},
            {"name": "--color-accent", "value": "#B45331"},
        ],
    )


def fintech_dense() -> dict:
    """Dense Inter fintech dashboard — spacing chaos + system font."""
    font = "Inter, system-ui, sans-serif"
    ink = "rgb(15, 23, 42)"
    paper = "rgb(248, 250, 252)"
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
        probe("button", "button.primary", True, False),
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


def marketplace_clutter() -> dict:
    """Busy consumer marketplace — Inter, gradient hero, emoji chrome, centered cards, responsive collapse."""
    font = "Inter, system-ui, sans-serif"
    ink = "rgb(15, 15, 15)"
    paper = "rgb(255, 255, 255)"
    violet = "rgb(124, 58, 237)"
    shadow = "rgba(0, 0, 0, 0.12) 0px 8px 24px"
    styles = [
        style("body", font=font, size="16px", weight="400", color=ink, bg=paper, role="surface", tag="body", padding="0px"),
        style(
            "section.hero",
            font=font,
            size="16px",
            weight="400",
            color="rgb(255, 255, 255)",
            bg="rgb(15, 15, 15)",
            role="surface",
            tag="section",
            padding="80px 24px",
            align="center",
            bg_image="linear-gradient(135deg, rgb(124, 58, 237), rgb(236, 72, 153))",
        ),
        style("h1", font=font, size="48px", weight="700", color="rgb(255, 255, 255)", bg="rgba(0, 0, 0, 0)", role="display", tag="h1", padding="0px", align="center"),
        style("h2", font=font, size="28px", weight="600", color=ink, bg="rgba(0, 0, 0, 0)", role="heading", tag="h2", padding="0px", align="center"),
        style("h3", font=font, size="20px", weight="600", color=ink, bg="rgba(0, 0, 0, 0)", role="heading", tag="h3", padding="0px", align="center"),
        style("button.primary", font=font, size="15px", weight="600", color="rgb(255, 255, 255)", bg=violet, radius="8px", shadow=shadow, role="button", tag="button", padding="12px 20px"),
        style("button.secondary", font=font, size="15px", weight="500", color=ink, bg="rgb(255, 255, 255)", radius="8px", shadow=shadow, role="button", tag="button", padding="12px 20px"),
        style("nav", font=font, size="14px", weight="500", color=ink, bg=paper, role="nav", tag="nav", padding="16px 24px"),
        style("a", font=font, size="14px", weight="500", color=violet, bg="rgba(0, 0, 0, 0)", role="link", tag="a", padding="0px"),
    ]
    for i in range(8):
        styles.append(
            style(
                f".card-{i}",
                font=font,
                size="15px",
                weight="400",
                color=ink,
                bg="rgb(255, 255, 255)",
                radius="8px",
                shadow=shadow,
                padding="24px",
                align="center",
                role="card",
                tag="article",
            )
        )
    probes = [
        probe("button", "button.primary", True, False),
        probe("button", "button.secondary", False, False),
        probe("a", "nav a", True, False),
        probe("a", "a.cta", False, False),
    ]
    viewport_matrix = [
        {
            "preset": "tablet",
            "width": 768,
            "height": 1024,
            "screenshotBase64": TINY_PNG,
            "domSummary": {"headingCount": 4, "buttonCount": 3, "centeredBlockRatio": 0.85, "emojiInUiCount": 5},
        },
        {
            "preset": "mobile",
            "width": 390,
            "height": 844,
            "screenshotBase64": TINY_PNG,
            # Structure collapses vs desktop → ResponsiveViewportDrift
            "domSummary": {"headingCount": 1, "buttonCount": 1, "centeredBlockRatio": 0.95, "emojiInUiCount": 4},
        },
    ]
    return capture(
        url="corpus://marketplace-clutter",
        styles=styles,
        probes=probes,
        dom={"headingCount": 6, "buttonCount": 8, "centeredBlockRatio": 0.82, "emojiInUiCount": 6},
        viewport_matrix=viewport_matrix,
    )


def docs_site_calm() -> dict:
    """Technical docs site — distinctive mono + serif, strong focus, left-aligned. Zero detectors."""
    display = '"IBM Plex Serif", Georgia, serif'
    body = '"IBM Plex Sans", "Segoe UI", sans-serif'
    mono = '"IBM Plex Mono", ui-monospace, monospace'
    # Mid ink (not near-black) + opaque paper — avoids AcidAccentTell false positives from transparent→#000.
    ink = "rgb(63, 63, 70)"
    paper = "rgb(250, 250, 250)"
    accent = "rgb(14, 116, 144)"
    styles = [
        style("body", font=body, size="16px", weight="400", color=ink, bg=paper, role="surface", tag="body", padding="0px"),
        style("h1", font=display, size="40px", weight="600", color=ink, bg=paper, role="display", tag="h1", padding="0px"),
        style("h2", font=display, size="28px", weight="600", color=ink, bg=paper, role="heading", tag="h2", padding="0px"),
        style("p", font=body, size="16px", weight="400", color="rgb(82, 82, 91)", bg=paper, role="body", tag="p", padding="0px"),
        style("code", font=mono, size="14px", weight="400", color=ink, bg="rgb(244, 244, 245)", radius="4px", role="body", tag="code", padding="4px 8px"),
        style("button.primary", font=body, size="14px", weight="600", color="rgb(255, 255, 255)", bg=accent, radius="6px", role="button", tag="button", padding="12px 16px"),
        style("nav", font=body, size="14px", weight="500", color=ink, bg="rgb(255, 255, 255)", role="nav", tag="nav", padding="12px 20px"),
        style("a", font=body, size="14px", weight="500", color=accent, bg=paper, role="link", tag="a", padding="0px"),
        style("aside", font=body, size="14px", weight="400", color=ink, bg="rgb(255, 255, 255)", role="surface", tag="aside", padding="24px"),
        style("article", font=body, size="16px", weight="400", color=ink, bg=paper, role="surface", tag="article", padding="32px"),
    ]
    probes = [
        probe("button", "button.primary", True, True),
        probe("a", "nav a", True, True),
        probe("a", "aside a", True, True),
        probe("button", "button.copy", True, True, True),
    ]
    return capture(
        url="corpus://docs-site-calm",
        styles=styles,
        probes=probes,
        dom={"headingCount": 5, "buttonCount": 2, "centeredBlockRatio": 0.1, "emojiInUiCount": 0},
        css_vars=[
            {"name": "--ink", "value": "#3F3F46"},
            {"name": "--accent", "value": "#0E7490"},
        ],
    )


def scenario_cell(
    *,
    route: str,
    viewport: str,
    theme: str,
    interaction: str,
    payload: dict,
    auth_role: str = "anonymous",
) -> dict:
    route_key = "root" if route == "/" else route.lstrip("/").replace("/", "_")
    sid = f"{route_key}__{viewport}__{theme}__{interaction}__{auth_role}"
    return {
        "scenario": {
            "id": sid,
            "route": route,
            "viewport": viewport,
            "theme": theme,
            "interaction": interaction,
            "authRole": auth_role,
        },
        "capture": payload,
    }


def build_scenario_matrix() -> dict:
    """Committed matrix covering route × viewport × theme × interaction (auth=anonymous)."""
    market = marketplace_clutter()
    market_pricing = {
        **market,
        "url": "corpus://marketplace-clutter/pricing",
        "screenshotBase64": TINY_PNG_ALT,
        "domSummary": {**market["domSummary"], "headingCount": 5, "buttonCount": 7},
    }
    market_mobile = {
        **market,
        "url": "corpus://marketplace-clutter",
        "viewport": {"width": 390, "height": 844},
        "viewportMatrix": [],
        "domSummary": {"headingCount": 1, "buttonCount": 1, "centeredBlockRatio": 0.95, "emojiInUiCount": 4},
    }
    market_dark = {
        **market,
        "url": "corpus://marketplace-clutter",
        "screenshotBase64": TINY_PNG_ALT,
        "styles": [
            {
                **s,
                "backgroundColor": "rgb(15, 15, 15)" if s["role"] in ("surface", "nav") else s["backgroundColor"],
                "color": "rgb(244, 244, 245)" if s["color"] == "rgb(15, 15, 15)" else s["color"],
            }
            for s in market["styles"]
        ],
    }
    market_hover = {
        **market,
        "url": "corpus://marketplace-clutter",
        "screenshotBase64": TINY_PNG_ALT,
    }
    docs = docs_site_calm()

    cells = [
        scenario_cell(route="/", viewport="desktop", theme="light", interaction="default", payload=market),
        scenario_cell(route="/", viewport="tablet", theme="light", interaction="default", payload={
            **market,
            "viewport": {"width": 768, "height": 1024},
            "viewportMatrix": [],
            "domSummary": {"headingCount": 4, "buttonCount": 3, "centeredBlockRatio": 0.85, "emojiInUiCount": 5},
        }),
        scenario_cell(route="/", viewport="mobile", theme="light", interaction="default", payload=market_mobile),
        scenario_cell(route="/pricing", viewport="desktop", theme="light", interaction="default", payload=market_pricing),
        scenario_cell(route="/", viewport="desktop", theme="dark", interaction="default", payload=market_dark),
        scenario_cell(route="/", viewport="desktop", theme="light", interaction="hover", payload=market_hover),
        scenario_cell(route="/", viewport="desktop", theme="light", interaction="default", payload=docs),
    ]
    # Last cell is a second base profile under a docs baseUrl? Keep single baseUrl marketplace;
    # docs cell uses docs url inside capture but scenario still under marketplace matrix for smoke.
    # Replace docs cell with marketplace focus variant instead for consistent baseUrl.
    cells[-1] = scenario_cell(
        route="/",
        viewport="desktop",
        theme="light",
        interaction="focus",
        payload={**market, "screenshotBase64": TINY_PNG_ALT},
    )

    return {
        "baseUrl": "corpus://marketplace-clutter",
        "capturedAt": "2026-07-19T00:00:00.000Z",
        "cells": cells,
    }


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    # editorial-calm / fintech-dense are hand-tuned golden fixtures — only write if missing.
    preserve = {"editorial-calm.json", "fintech-dense.json"}
    fixtures = {
        "editorial-calm.json": editorial_calm(),
        "fintech-dense.json": fintech_dense(),
        "marketplace-clutter.json": marketplace_clutter(),
        "docs-site-calm.json": docs_site_calm(),
    }
    for name, payload in fixtures.items():
        path = OUT / name
        if name in preserve and path.exists():
            print(f"keep  {path.relative_to(ROOT)} (hand-tuned)")
            continue
        path.write_text(json.dumps(payload, indent=2) + "\n")
        print(f"wrote {path.relative_to(ROOT)} ({len(payload['styles'])} styles)")

    matrix = build_scenario_matrix()
    MATRIX_OUT.write_text(json.dumps(matrix, indent=2) + "\n")
    print(f"wrote {MATRIX_OUT.relative_to(ROOT)} ({len(matrix['cells'])} cells)")


if __name__ == "__main__":
    main()
