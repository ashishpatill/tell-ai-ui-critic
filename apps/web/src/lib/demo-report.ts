// Auto-generated from fixtures/reports/tell-report.json (the deliberately-generic sample app).
// Real 42-element capture so the on-load demo shows a genuine scorecard + working before/after seam.
// Screenshot omitted to keep the client bundle small; the live seam uses snapshotHtml.
import type { TellReport } from "@tell/schema";

export const demoReport: TellReport = {
  "capture": {
    "url": "http://localhost:3001",
    "capturedAt": "2026-07-04T17:48:08.172Z",
    "viewport": {
      "width": 1440,
      "height": 1100
    },
    "screenshotBase64": "",
    "snapshotHtml": "<!DOCTYPE html><html lang=\"en\"><head><base href=\"http://localhost:3001/\"><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><link rel=\"stylesheet\" href=\"/_next/static/css/app/layout.css?v=1783187286885\" data-precedence=\"next_static/css/app/layout.css\"><style data-tell-inlined=\"\">body { margin: 0px; font-family: Inter, system-ui, sans-serif; background: rgb(15, 15, 15); color: rgb(244, 244, 245); }\nmain, section, header, footer { text-align: center; }\nbutton, a { border-radius: 8px; }\n.hero { padding: 77px 23px 93px; background: linear-gradient(135deg, rgb(139, 92, 246), rgb(236, 72, 153)); }\n.nav { display: flex; justify-content: center; gap: 19px; padding: 21px; }\n.nav a { color: rgb(243, 244, 246); text-decoration: none; }\n.pill { display: inline-block; border-radius: 8px; padding: 11px 17px; background: rgb(17, 24, 39); box-shadow: rgba(0, 0, 0, 0.35) 0px 10px 25px; }\n.button { display: inline-block; margin: 23px 7px; padding: 13px 27px; background: rgb(139, 92, 246); color: white; border: 0px; text-decoration: none; box-shadow: rgba(0, 0, 0, 0.35) 0px 10px 25px; }\n.button.secondary { background: rgb(24, 24, 27); color: rgb(245, 245, 244); }\n.button.no-focus:focus { outline: none; }\n.cards { display: grid; max-width: 1080px; margin: 37px auto; grid-template-columns: repeat(3, 1fr); gap: 19px; padding: 0px 29px; }\n.card { border-radius: 8px; padding: 31px; background: rgb(17, 24, 39); box-shadow: rgba(0, 0, 0, 0.35) 0px 10px 25px; }\n.card:nth-child(2) { background: rgb(17, 24, 31); }\n.card:nth-child(3) { background: rgb(16, 22, 32); }\n.muted-a { color: rgb(243, 244, 246); }\n.muted-b { color: rgb(244, 244, 245); }\n.muted-c { color: rgb(245, 245, 244); }\n.muted-d { color: rgb(242, 242, 242); }\n.muted-e { color: rgb(246, 246, 246); }\n.odd-type h2 { font-size: 29px; }\n.odd-type p:nth-child(2) { font-size: 15px; }\n.odd-type p:nth-child(3) { font-size: 19px; }\n.odd-type p:nth-child(4) { font-size: 22px; }\n.brutalist { font-family: \"IBM Plex Mono\", ui-monospace, monospace; background: rgb(243, 244, 246); color: rgb(17, 24, 39); padding: 88px 24px; text-align: left; }\n</style></head><body data-tell-id=\"t0\"><main data-tell-id=\"t1\"><div class=\"pill\">Demo input — deliberately generic. Not Tell's UI.</div><nav class=\"nav\" data-tell-id=\"t2\"><a href=\"#features\" data-tell-id=\"t3\">🚀 Features</a><a href=\"#metrics\" data-tell-id=\"t4\">📊 Metrics</a><a href=\"/brutalist\" data-tell-id=\"t5\">✨ Brutalist route</a></nav><header class=\"hero\" data-tell-id=\"t6\"><p class=\"pill\" data-tell-id=\"t7\">AI-powered analytics</p><h1 style=\"font-size:63px\" data-tell-id=\"t8\">Ship insights faster ✨</h1><p class=\"muted-a\" style=\"font-size:18px\" data-tell-id=\"t9\">A beautiful dashboard for modern teams.</p><a class=\"button no-focus\" href=\"#features\" data-tell-id=\"t10\">Get started 🚀</a><a class=\"button secondary\" href=\"#metrics\" data-tell-id=\"t11\">View dashboard 📊</a></header><section id=\"features\" class=\"cards odd-type\" data-tell-id=\"t12\"><article class=\"card\" data-tell-id=\"t13\"><h2 data-tell-id=\"t14\">Automate<!-- --> ✨</h2><p class=\"muted-b\" data-tell-id=\"t15\">Everything your team needs in one place.</p><p class=\"muted-c\" data-tell-id=\"t16\">Beautiful insights without the setup.</p><p class=\"muted-d\" data-tell-id=\"t17\">Built for modern workflows.</p><button class=\"button no-focus\" data-tell-id=\"t18\">Learn more</button></article><article class=\"card\" data-tell-id=\"t19\"><h2 data-tell-id=\"t20\">Analyze<!-- --> ✨</h2><p class=\"muted-b\" data-tell-id=\"t21\">Everything your team needs in one place.</p><p class=\"muted-c\" data-tell-id=\"t22\">Beautiful insights without the setup.</p><p class=\"muted-d\" data-tell-id=\"t23\">Built for modern workflows.</p><button class=\"button\" data-tell-id=\"t24\">Learn more</button></article><article class=\"card\" data-tell-id=\"t25\"><h2 data-tell-id=\"t26\">Scale<!-- --> ✨</h2><p class=\"muted-b\" data-tell-id=\"t27\">Everything your team needs in one place.</p><p class=\"muted-c\" data-tell-id=\"t28\">Beautiful insights without the setup.</p><p class=\"muted-d\" data-tell-id=\"t29\">Built for modern workflows.</p><button class=\"button\" data-tell-id=\"t30\">Learn more</button></article></section><section id=\"metrics\" class=\"cards\" data-tell-id=\"t31\"><article class=\"card\" data-tell-id=\"t32\"><h2 style=\"font-size:41px\" data-tell-id=\"t33\">98%</h2><p class=\"muted-e\" data-tell-id=\"t34\">Metric that looks important.</p></article><article class=\"card\" data-tell-id=\"t35\"><h2 style=\"font-size:41px\" data-tell-id=\"t36\">24k</h2><p class=\"muted-e\" data-tell-id=\"t37\">Metric that looks important.</p></article><article class=\"card\" data-tell-id=\"t38\"><h2 style=\"font-size:41px\" data-tell-id=\"t39\">3.2x</h2><p class=\"muted-e\" data-tell-id=\"t40\">Metric that looks important.</p></article></section><footer style=\"padding:47px\" data-tell-id=\"t41\">Made with AI. Looks familiar.</footer></main><next-route-announcer style=\"position: absolute;\"></next-route-announcer></body></html>",
    "cssVariables": [],
    "surfaceTokens": {
      "bodyBg": "rgb(15, 15, 15)",
      "bodyText": "rgb(244, 244, 245)",
      "bodyFont": "Inter",
      "headingFont": "Inter",
      "accent": "rgb(139, 92, 246)",
      "accentSources": [
        "rgb(139, 92, 246)"
      ],
      "radius": "8px",
      "shadow": "rgba(0, 0, 0, 0.35) 0px 10px 25px 0px"
    },
    "styles": [
      {
        "selector": "body",
        "tellId": "t0",
        "tag": "body",
        "role": "body",
        "rect": {
          "x": 0,
          "y": 0,
          "w": 1440,
          "h": 1477
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "16px",
        "fontWeight": "400",
        "color": "rgb(244, 244, 245)",
        "backgroundColor": "rgb(15, 15, 15)",
        "borderRadius": "0px",
        "boxShadow": "none",
        "padding": "0px",
        "textAlign": "start",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "main",
        "tellId": "t1",
        "tag": "main",
        "role": "surface",
        "rect": {
          "x": 0,
          "y": 0,
          "w": 1440,
          "h": 1477
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "16px",
        "fontWeight": "400",
        "color": "rgb(244, 244, 245)",
        "backgroundColor": "rgba(0, 0, 0, 0)",
        "borderRadius": "0px",
        "boxShadow": "none",
        "padding": "0px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "nav.nav",
        "tellId": "t2",
        "tag": "nav",
        "role": "nav",
        "rect": {
          "x": 0,
          "y": 40,
          "w": 1440,
          "h": 68
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "16px",
        "fontWeight": "400",
        "color": "rgb(244, 244, 245)",
        "backgroundColor": "rgba(0, 0, 0, 0)",
        "borderRadius": "0px",
        "boxShadow": "none",
        "padding": "21px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "a",
        "tellId": "t3",
        "tag": "a",
        "role": "link",
        "rect": {
          "x": 555,
          "y": 61,
          "w": 87,
          "h": 26
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "16px",
        "fontWeight": "400",
        "color": "rgb(243, 244, 246)",
        "backgroundColor": "rgba(0, 0, 0, 0)",
        "borderRadius": "8px",
        "boxShadow": "none",
        "padding": "0px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "a",
        "tellId": "t4",
        "tag": "a",
        "role": "link",
        "rect": {
          "x": 661,
          "y": 61,
          "w": 78,
          "h": 26
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "16px",
        "fontWeight": "400",
        "color": "rgb(243, 244, 246)",
        "backgroundColor": "rgba(0, 0, 0, 0)",
        "borderRadius": "8px",
        "boxShadow": "none",
        "padding": "0px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "a",
        "tellId": "t5",
        "tag": "a",
        "role": "link",
        "rect": {
          "x": 759,
          "y": 61,
          "w": 126,
          "h": 26
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "16px",
        "fontWeight": "400",
        "color": "rgb(243, 244, 246)",
        "backgroundColor": "rgba(0, 0, 0, 0)",
        "borderRadius": "8px",
        "boxShadow": "none",
        "padding": "0px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "header.hero",
        "tellId": "t6",
        "tag": "header",
        "role": "surface",
        "rect": {
          "x": 0,
          "y": 108,
          "w": 1440,
          "h": 546
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "16px",
        "fontWeight": "400",
        "color": "rgb(244, 244, 245)",
        "backgroundColor": "rgba(0, 0, 0, 0)",
        "borderRadius": "0px",
        "boxShadow": "none",
        "padding": "77px 23px 93px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "linear-gradient(135deg, rgb(139, 92, 246), rgb(236, 72, 153))"
      },
      {
        "selector": "p.pill",
        "tellId": "t7",
        "tag": "p",
        "role": "body",
        "rect": {
          "x": 627,
          "y": 201,
          "w": 187,
          "h": 40
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "16px",
        "fontWeight": "400",
        "color": "rgb(244, 244, 245)",
        "backgroundColor": "rgb(17, 24, 39)",
        "borderRadius": "8px",
        "boxShadow": "rgba(0, 0, 0, 0.35) 0px 10px 25px 0px",
        "padding": "11px 17px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "h1",
        "tellId": "t8",
        "tag": "h1",
        "role": "display",
        "rect": {
          "x": 23,
          "y": 299,
          "w": 1394,
          "h": 83
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "63px",
        "fontWeight": "700",
        "color": "rgb(244, 244, 245)",
        "backgroundColor": "rgba(0, 0, 0, 0)",
        "borderRadius": "0px",
        "boxShadow": "none",
        "padding": "0px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "p.muted-a",
        "tellId": "t9",
        "tag": "p",
        "role": "body",
        "rect": {
          "x": 23,
          "y": 424,
          "w": 1394,
          "h": 21
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "18px",
        "fontWeight": "400",
        "color": "rgb(243, 244, 246)",
        "backgroundColor": "rgba(0, 0, 0, 0)",
        "borderRadius": "0px",
        "boxShadow": "none",
        "padding": "0px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "a.button",
        "tellId": "t10",
        "tag": "a",
        "role": "button",
        "rect": {
          "x": 536,
          "y": 486,
          "w": 160,
          "h": 52
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "16px",
        "fontWeight": "400",
        "color": "rgb(255, 255, 255)",
        "backgroundColor": "rgb(139, 92, 246)",
        "borderRadius": "8px",
        "boxShadow": "rgba(0, 0, 0, 0.35) 0px 10px 25px 0px",
        "padding": "13px 27px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "a.button",
        "tellId": "t11",
        "tag": "a",
        "role": "button",
        "rect": {
          "x": 710,
          "y": 486,
          "w": 195,
          "h": 52
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "16px",
        "fontWeight": "400",
        "color": "rgb(245, 245, 244)",
        "backgroundColor": "rgb(24, 24, 27)",
        "borderRadius": "8px",
        "boxShadow": "rgba(0, 0, 0, 0.35) 0px 10px 25px 0px",
        "padding": "13px 27px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "#features",
        "tellId": "t12",
        "tag": "section",
        "role": "card",
        "rect": {
          "x": 151,
          "y": 691,
          "w": 1138,
          "h": 386
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "16px",
        "fontWeight": "400",
        "color": "rgb(244, 244, 245)",
        "backgroundColor": "rgba(0, 0, 0, 0)",
        "borderRadius": "0px",
        "boxShadow": "none",
        "padding": "0px 29px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "article.card",
        "tellId": "t13",
        "tag": "article",
        "role": "card",
        "rect": {
          "x": 180,
          "y": 691,
          "w": 347,
          "h": 386
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "16px",
        "fontWeight": "400",
        "color": "rgb(244, 244, 245)",
        "backgroundColor": "rgb(17, 24, 39)",
        "borderRadius": "8px",
        "boxShadow": "rgba(0, 0, 0, 0.35) 0px 10px 25px 0px",
        "padding": "31px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "h2",
        "tellId": "t14",
        "tag": "h2",
        "role": "heading",
        "rect": {
          "x": 211,
          "y": 746,
          "w": 285,
          "h": 38
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "29px",
        "fontWeight": "700",
        "color": "rgb(244, 244, 245)",
        "backgroundColor": "rgba(0, 0, 0, 0)",
        "borderRadius": "0px",
        "boxShadow": "none",
        "padding": "0px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "p.muted-b",
        "tellId": "t15",
        "tag": "p",
        "role": "body",
        "rect": {
          "x": 211,
          "y": 809,
          "w": 285,
          "h": 18
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "15px",
        "fontWeight": "400",
        "color": "rgb(244, 244, 245)",
        "backgroundColor": "rgba(0, 0, 0, 0)",
        "borderRadius": "0px",
        "boxShadow": "none",
        "padding": "0px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "p.muted-c",
        "tellId": "t16",
        "tag": "p",
        "role": "body",
        "rect": {
          "x": 211,
          "y": 846,
          "w": 285,
          "h": 44
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "19px",
        "fontWeight": "400",
        "color": "rgb(245, 245, 244)",
        "backgroundColor": "rgba(0, 0, 0, 0)",
        "borderRadius": "0px",
        "boxShadow": "none",
        "padding": "0px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "p.muted-d",
        "tellId": "t17",
        "tag": "p",
        "role": "heading",
        "rect": {
          "x": 211,
          "y": 912,
          "w": 285,
          "h": 26
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "22px",
        "fontWeight": "400",
        "color": "rgb(242, 242, 242)",
        "backgroundColor": "rgba(0, 0, 0, 0)",
        "borderRadius": "0px",
        "boxShadow": "none",
        "padding": "0px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "button.button",
        "tellId": "t18",
        "tag": "button",
        "role": "button",
        "rect": {
          "x": 293,
          "y": 983,
          "w": 122,
          "h": 41
        },
        "fontFamily": "Arial",
        "fontSize": "13.3333px",
        "fontWeight": "400",
        "color": "rgb(255, 255, 255)",
        "backgroundColor": "rgb(139, 92, 246)",
        "borderRadius": "8px",
        "boxShadow": "rgba(0, 0, 0, 0.35) 0px 10px 25px 0px",
        "padding": "13px 27px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "article.card",
        "tellId": "t19",
        "tag": "article",
        "role": "card",
        "rect": {
          "x": 546,
          "y": 691,
          "w": 347,
          "h": 386
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "16px",
        "fontWeight": "400",
        "color": "rgb(244, 244, 245)",
        "backgroundColor": "rgb(17, 24, 31)",
        "borderRadius": "8px",
        "boxShadow": "rgba(0, 0, 0, 0.35) 0px 10px 25px 0px",
        "padding": "31px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "h2",
        "tellId": "t20",
        "tag": "h2",
        "role": "heading",
        "rect": {
          "x": 577,
          "y": 746,
          "w": 285,
          "h": 38
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "29px",
        "fontWeight": "700",
        "color": "rgb(244, 244, 245)",
        "backgroundColor": "rgba(0, 0, 0, 0)",
        "borderRadius": "0px",
        "boxShadow": "none",
        "padding": "0px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "p.muted-b",
        "tellId": "t21",
        "tag": "p",
        "role": "body",
        "rect": {
          "x": 577,
          "y": 809,
          "w": 285,
          "h": 18
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "15px",
        "fontWeight": "400",
        "color": "rgb(244, 244, 245)",
        "backgroundColor": "rgba(0, 0, 0, 0)",
        "borderRadius": "0px",
        "boxShadow": "none",
        "padding": "0px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "p.muted-c",
        "tellId": "t22",
        "tag": "p",
        "role": "body",
        "rect": {
          "x": 577,
          "y": 846,
          "w": 285,
          "h": 44
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "19px",
        "fontWeight": "400",
        "color": "rgb(245, 245, 244)",
        "backgroundColor": "rgba(0, 0, 0, 0)",
        "borderRadius": "0px",
        "boxShadow": "none",
        "padding": "0px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "p.muted-d",
        "tellId": "t23",
        "tag": "p",
        "role": "heading",
        "rect": {
          "x": 577,
          "y": 912,
          "w": 285,
          "h": 26
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "22px",
        "fontWeight": "400",
        "color": "rgb(242, 242, 242)",
        "backgroundColor": "rgba(0, 0, 0, 0)",
        "borderRadius": "0px",
        "boxShadow": "none",
        "padding": "0px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "button.button",
        "tellId": "t24",
        "tag": "button",
        "role": "button",
        "rect": {
          "x": 659,
          "y": 983,
          "w": 122,
          "h": 41
        },
        "fontFamily": "Arial",
        "fontSize": "13.3333px",
        "fontWeight": "400",
        "color": "rgb(255, 255, 255)",
        "backgroundColor": "rgb(139, 92, 246)",
        "borderRadius": "8px",
        "boxShadow": "rgba(0, 0, 0, 0.35) 0px 10px 25px 0px",
        "padding": "13px 27px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "article.card",
        "tellId": "t25",
        "tag": "article",
        "role": "card",
        "rect": {
          "x": 913,
          "y": 691,
          "w": 347,
          "h": 386
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "16px",
        "fontWeight": "400",
        "color": "rgb(244, 244, 245)",
        "backgroundColor": "rgb(16, 22, 32)",
        "borderRadius": "8px",
        "boxShadow": "rgba(0, 0, 0, 0.35) 0px 10px 25px 0px",
        "padding": "31px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "h2",
        "tellId": "t26",
        "tag": "h2",
        "role": "heading",
        "rect": {
          "x": 944,
          "y": 746,
          "w": 285,
          "h": 38
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "29px",
        "fontWeight": "700",
        "color": "rgb(244, 244, 245)",
        "backgroundColor": "rgba(0, 0, 0, 0)",
        "borderRadius": "0px",
        "boxShadow": "none",
        "padding": "0px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "p.muted-b",
        "tellId": "t27",
        "tag": "p",
        "role": "body",
        "rect": {
          "x": 944,
          "y": 809,
          "w": 285,
          "h": 18
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "15px",
        "fontWeight": "400",
        "color": "rgb(244, 244, 245)",
        "backgroundColor": "rgba(0, 0, 0, 0)",
        "borderRadius": "0px",
        "boxShadow": "none",
        "padding": "0px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "p.muted-c",
        "tellId": "t28",
        "tag": "p",
        "role": "body",
        "rect": {
          "x": 944,
          "y": 846,
          "w": 285,
          "h": 44
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "19px",
        "fontWeight": "400",
        "color": "rgb(245, 245, 244)",
        "backgroundColor": "rgba(0, 0, 0, 0)",
        "borderRadius": "0px",
        "boxShadow": "none",
        "padding": "0px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "p.muted-d",
        "tellId": "t29",
        "tag": "p",
        "role": "heading",
        "rect": {
          "x": 944,
          "y": 912,
          "w": 285,
          "h": 26
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "22px",
        "fontWeight": "400",
        "color": "rgb(242, 242, 242)",
        "backgroundColor": "rgba(0, 0, 0, 0)",
        "borderRadius": "0px",
        "boxShadow": "none",
        "padding": "0px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "button.button",
        "tellId": "t30",
        "tag": "button",
        "role": "button",
        "rect": {
          "x": 1025,
          "y": 983,
          "w": 122,
          "h": 41
        },
        "fontFamily": "Arial",
        "fontSize": "13.3333px",
        "fontWeight": "400",
        "color": "rgb(255, 255, 255)",
        "backgroundColor": "rgb(139, 92, 246)",
        "borderRadius": "8px",
        "boxShadow": "rgba(0, 0, 0, 0.35) 0px 10px 25px 0px",
        "padding": "13px 27px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "#metrics",
        "tellId": "t31",
        "tag": "section",
        "role": "card",
        "rect": {
          "x": 151,
          "y": 1115,
          "w": 1138,
          "h": 213
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "16px",
        "fontWeight": "400",
        "color": "rgb(244, 244, 245)",
        "backgroundColor": "rgba(0, 0, 0, 0)",
        "borderRadius": "0px",
        "boxShadow": "none",
        "padding": "0px 29px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "article.card",
        "tellId": "t32",
        "tag": "article",
        "role": "card",
        "rect": {
          "x": 180,
          "y": 1115,
          "w": 347,
          "h": 213
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "16px",
        "fontWeight": "400",
        "color": "rgb(244, 244, 245)",
        "backgroundColor": "rgb(17, 24, 39)",
        "borderRadius": "8px",
        "boxShadow": "rgba(0, 0, 0, 0.35) 0px 10px 25px 0px",
        "padding": "31px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "h2",
        "tellId": "t33",
        "tag": "h2",
        "role": "display",
        "rect": {
          "x": 211,
          "y": 1180,
          "w": 285,
          "h": 49
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "41px",
        "fontWeight": "700",
        "color": "rgb(244, 244, 245)",
        "backgroundColor": "rgba(0, 0, 0, 0)",
        "borderRadius": "0px",
        "boxShadow": "none",
        "padding": "0px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "p.muted-e",
        "tellId": "t34",
        "tag": "p",
        "role": "body",
        "rect": {
          "x": 211,
          "y": 1263,
          "w": 285,
          "h": 18
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "16px",
        "fontWeight": "400",
        "color": "rgb(246, 246, 246)",
        "backgroundColor": "rgba(0, 0, 0, 0)",
        "borderRadius": "0px",
        "boxShadow": "none",
        "padding": "0px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "article.card",
        "tellId": "t35",
        "tag": "article",
        "role": "card",
        "rect": {
          "x": 546,
          "y": 1115,
          "w": 347,
          "h": 213
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "16px",
        "fontWeight": "400",
        "color": "rgb(244, 244, 245)",
        "backgroundColor": "rgb(17, 24, 31)",
        "borderRadius": "8px",
        "boxShadow": "rgba(0, 0, 0, 0.35) 0px 10px 25px 0px",
        "padding": "31px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "h2",
        "tellId": "t36",
        "tag": "h2",
        "role": "display",
        "rect": {
          "x": 577,
          "y": 1180,
          "w": 285,
          "h": 49
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "41px",
        "fontWeight": "700",
        "color": "rgb(244, 244, 245)",
        "backgroundColor": "rgba(0, 0, 0, 0)",
        "borderRadius": "0px",
        "boxShadow": "none",
        "padding": "0px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "p.muted-e",
        "tellId": "t37",
        "tag": "p",
        "role": "body",
        "rect": {
          "x": 577,
          "y": 1263,
          "w": 285,
          "h": 18
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "16px",
        "fontWeight": "400",
        "color": "rgb(246, 246, 246)",
        "backgroundColor": "rgba(0, 0, 0, 0)",
        "borderRadius": "0px",
        "boxShadow": "none",
        "padding": "0px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "article.card",
        "tellId": "t38",
        "tag": "article",
        "role": "card",
        "rect": {
          "x": 913,
          "y": 1115,
          "w": 347,
          "h": 213
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "16px",
        "fontWeight": "400",
        "color": "rgb(244, 244, 245)",
        "backgroundColor": "rgb(16, 22, 32)",
        "borderRadius": "8px",
        "boxShadow": "rgba(0, 0, 0, 0.35) 0px 10px 25px 0px",
        "padding": "31px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "h2",
        "tellId": "t39",
        "tag": "h2",
        "role": "display",
        "rect": {
          "x": 944,
          "y": 1180,
          "w": 285,
          "h": 49
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "41px",
        "fontWeight": "700",
        "color": "rgb(244, 244, 245)",
        "backgroundColor": "rgba(0, 0, 0, 0)",
        "borderRadius": "0px",
        "boxShadow": "none",
        "padding": "0px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "p.muted-e",
        "tellId": "t40",
        "tag": "p",
        "role": "body",
        "rect": {
          "x": 944,
          "y": 1263,
          "w": 285,
          "h": 18
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "16px",
        "fontWeight": "400",
        "color": "rgb(246, 246, 246)",
        "backgroundColor": "rgba(0, 0, 0, 0)",
        "borderRadius": "0px",
        "boxShadow": "none",
        "padding": "0px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "footer",
        "tellId": "t41",
        "tag": "footer",
        "role": "surface",
        "rect": {
          "x": 0,
          "y": 1365,
          "w": 1440,
          "h": 112
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "16px",
        "fontWeight": "400",
        "color": "rgb(244, 244, 245)",
        "backgroundColor": "rgba(0, 0, 0, 0)",
        "borderRadius": "0px",
        "boxShadow": "none",
        "padding": "47px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      }
    ],
    "probes": [
      {
        "role": "a",
        "selector": "a:nth-of-type(1)",
        "hasHoverDiff": false,
        "hasFocusVisibleDiff": false,
        "hasDisabledAttr": false,
        "ariaDisabled": false
      },
      {
        "role": "a",
        "selector": "a:nth-of-type(2)",
        "hasHoverDiff": false,
        "hasFocusVisibleDiff": false,
        "hasDisabledAttr": false,
        "ariaDisabled": false
      },
      {
        "role": "a",
        "selector": "a:nth-of-type(3)",
        "hasHoverDiff": false,
        "hasFocusVisibleDiff": false,
        "hasDisabledAttr": false,
        "ariaDisabled": false
      },
      {
        "role": "a",
        "selector": "a:nth-of-type(4)",
        "hasHoverDiff": false,
        "hasFocusVisibleDiff": false,
        "hasDisabledAttr": false,
        "ariaDisabled": false
      },
      {
        "role": "a",
        "selector": "a:nth-of-type(5)",
        "hasHoverDiff": false,
        "hasFocusVisibleDiff": false,
        "hasDisabledAttr": false,
        "ariaDisabled": false
      },
      {
        "role": "button",
        "selector": "button:nth-of-type(6)",
        "hasHoverDiff": false,
        "hasFocusVisibleDiff": false,
        "hasDisabledAttr": false,
        "ariaDisabled": false
      },
      {
        "role": "button",
        "selector": "button:nth-of-type(7)",
        "hasHoverDiff": false,
        "hasFocusVisibleDiff": false,
        "hasDisabledAttr": false,
        "ariaDisabled": false
      },
      {
        "role": "button",
        "selector": "button:nth-of-type(8)",
        "hasHoverDiff": false,
        "hasFocusVisibleDiff": false,
        "hasDisabledAttr": false,
        "ariaDisabled": false
      }
    ],
    "domSummary": {
      "headingCount": 7,
      "buttonCount": 3,
      "centeredBlockRatio": 1,
      "emojiInUiCount": 12
    }
  },
  "fingerprint": {
    "url": "http://localhost:3001",
    "generatedAt": "2026-07-04T17:48:08.203Z",
    "fontFamilies": [
      {
        "family": "Inter",
        "count": 39,
        "roles": [
          "body",
          "main",
          "nav.nav",
          "a",
          "header.hero",
          "p.pill",
          "h1",
          "p.muted-a",
          "a.button",
          "#features",
          "article.card",
          "h2",
          "p.muted-b",
          "p.muted-c",
          "p.muted-d",
          "#metrics",
          "p.muted-e",
          "footer"
        ]
      },
      {
        "family": "Arial",
        "count": 3,
        "roles": [
          "button.button"
        ]
      }
    ],
    "colors": [
      {
        "value": "rgba(0, 0, 0, 0)",
        "count": 29,
        "normalizedHex": "#000000"
      },
      {
        "value": "rgb(244, 244, 245)",
        "count": 24,
        "normalizedHex": "#F4F4F5"
      },
      {
        "value": "rgb(243, 244, 246)",
        "count": 4,
        "normalizedHex": "#F3F4F6"
      },
      {
        "value": "rgb(255, 255, 255)",
        "count": 4,
        "normalizedHex": "#FFFFFF"
      },
      {
        "value": "rgb(139, 92, 246)",
        "count": 4,
        "normalizedHex": "#8B5CF6"
      },
      {
        "value": "rgb(245, 245, 244)",
        "count": 4,
        "normalizedHex": "#F5F5F4"
      },
      {
        "value": "rgb(17, 24, 39)",
        "count": 3,
        "normalizedHex": "#111827"
      },
      {
        "value": "rgb(242, 242, 242)",
        "count": 3,
        "normalizedHex": "#F2F2F2"
      },
      {
        "value": "rgb(246, 246, 246)",
        "count": 3,
        "normalizedHex": "#F6F6F6"
      },
      {
        "value": "rgb(17, 24, 31)",
        "count": 2,
        "normalizedHex": "#11181F"
      },
      {
        "value": "rgb(16, 22, 32)",
        "count": 2,
        "normalizedHex": "#101620"
      },
      {
        "value": "rgb(15, 15, 15)",
        "count": 1,
        "normalizedHex": "#0F0F0F"
      },
      {
        "value": "rgb(24, 24, 27)",
        "count": 1,
        "normalizedHex": "#18181B"
      }
    ],
    "shadows": [
      {
        "value": "none",
        "count": 30
      },
      {
        "value": "rgba(0, 0, 0, 0.35) 0px 10px 25px 0px",
        "count": 12
      }
    ],
    "radii": [
      {
        "value": "0px",
        "count": 27
      },
      {
        "value": "8px",
        "count": 15
      }
    ],
    "spacingValues": [
      {
        "value": "0px",
        "count": 25
      },
      {
        "value": "31px",
        "count": 6
      },
      {
        "value": "13px 27px",
        "count": 5
      },
      {
        "value": "0px 29px",
        "count": 2
      },
      {
        "value": "21px",
        "count": 1
      },
      {
        "value": "77px 23px 93px",
        "count": 1
      },
      {
        "value": "11px 17px",
        "count": 1
      },
      {
        "value": "47px",
        "count": 1
      }
    ],
    "typeScale": [
      {
        "size": "16px",
        "count": 22,
        "roles": []
      },
      {
        "size": "29px",
        "count": 3,
        "roles": []
      },
      {
        "size": "15px",
        "count": 3,
        "roles": []
      },
      {
        "size": "19px",
        "count": 3,
        "roles": []
      },
      {
        "size": "22px",
        "count": 3,
        "roles": []
      },
      {
        "size": "13.3333px",
        "count": 3,
        "roles": []
      },
      {
        "size": "41px",
        "count": 3,
        "roles": []
      },
      {
        "size": "63px",
        "count": 1,
        "roles": []
      },
      {
        "size": "18px",
        "count": 1,
        "roles": []
      }
    ],
    "centeredBlockRatio": 1,
    "emojiInUiCount": 12,
    "gradientDetected": true,
    "gradientSamples": [
      "linear-gradient(135deg, rgb(139, 92, 246), rgb(236, 72, 153))"
    ],
    "nearDuplicateGrays": [],
    "focusRingCoverage": 0,
    "stateCoverage": {
      "hover": 0,
      "focus": 0,
      "disabled": 1
    }
  },
  "findings": [
    {
      "id": "tell-system-font",
      "family": "tell",
      "detector": "SystemFontTell",
      "verdictHint": "generic",
      "facts": {
        "family": "Inter",
        "ratio": 0.9285714285714286,
        "roles": [
          "body",
          "main",
          "nav.nav",
          "a",
          "header.hero",
          "p.pill",
          "h1",
          "p.muted-a",
          "a.button",
          "#features",
          "article.card",
          "h2",
          "p.muted-b",
          "p.muted-c",
          "p.muted-d",
          "#metrics",
          "p.muted-e",
          "footer"
        ]
      },
      "evidence": [
        {
          "kind": "computed",
          "label": "Primary typeface",
          "value": "Inter"
        }
      ],
      "severity": "high"
    },
    {
      "id": "tell-gradient-crutch",
      "family": "tell",
      "detector": "GradientCrutchTell",
      "verdictHint": "generic",
      "facts": {
        "gradientSamples": [
          "linear-gradient(135deg, rgb(139, 92, 246), rgb(236, 72, 153))"
        ]
      },
      "evidence": [
        {
          "kind": "computed",
          "label": "Hero gradient",
          "value": "linear-gradient(135deg, rgb(139, 92, 246), rgb(236, 72, 153))"
        }
      ],
      "severity": "medium"
    },
    {
      "id": "tell-emoji-chrome",
      "family": "tell",
      "detector": "EmojiChromeTell",
      "verdictHint": "generic",
      "facts": {
        "count": 12
      },
      "evidence": [
        {
          "kind": "dom",
          "label": "Emoji in UI chrome",
          "value": "12"
        }
      ],
      "severity": "low"
    },
    {
      "id": "tell-centered-everything",
      "family": "tell",
      "detector": "CenteredEverythingTell",
      "verdictHint": "generic",
      "facts": {
        "ratio": 1
      },
      "evidence": [
        {
          "kind": "dom",
          "label": "Centered layout ratio",
          "value": "1.00"
        }
      ],
      "severity": "medium"
    },
    {
      "id": "drift-focus-ring",
      "family": "drift",
      "detector": "FocusRingInconsistency",
      "verdictHint": "drift",
      "facts": {
        "focusRingCoverage": 0
      },
      "evidence": [
        {
          "kind": "probe",
          "label": "Focus ring coverage",
          "value": "0.00"
        }
      ],
      "severity": "high"
    },
    {
      "id": "drift-type-scale",
      "family": "drift",
      "detector": "TypeScaleDrift",
      "verdictHint": "drift",
      "facts": {
        "sizes": [
          "16px",
          "29px",
          "15px",
          "19px",
          "22px",
          "13.3333px",
          "41px",
          "63px",
          "18px"
        ]
      },
      "evidence": [
        {
          "kind": "computed",
          "label": "Type sizes",
          "value": "16px, 29px, 15px, 19px, 22px, 13.3333px, 41px, 63px, 18px"
        }
      ],
      "severity": "medium"
    },
    {
      "id": "drift-spacing-chaos",
      "family": "drift",
      "detector": "SpacingChaos",
      "verdictHint": "drift",
      "facts": {
        "values": [
          "0px",
          "31px",
          "13px 27px",
          "0px 29px",
          "21px",
          "77px 23px 93px",
          "11px 17px",
          "47px"
        ]
      },
      "evidence": [
        {
          "kind": "computed",
          "label": "Spacing values",
          "value": "0px, 31px, 13px 27px, 0px 29px, 21px, 77px 23px 93px, 11px 17px, 47px"
        }
      ],
      "severity": "medium"
    },
    {
      "id": "drift-state-gap",
      "family": "drift",
      "detector": "StateGap",
      "verdictHint": "drift",
      "facts": {
        "stateCoverage": {
          "hover": 0,
          "focus": 0,
          "disabled": 1
        }
      },
      "evidence": [
        {
          "kind": "probe",
          "label": "State coverage",
          "value": "{\"hover\":0,\"focus\":0,\"disabled\":1}"
        }
      ],
      "severity": "high"
    },
    {
      "id": "tell-acid-accent",
      "family": "tell",
      "detector": "AcidAccentTell",
      "verdictHint": "generic",
      "facts": {
        "accent": "#8B5CF6",
        "usageCount": 4,
        "surface": "#000000"
      },
      "evidence": [
        {
          "kind": "computed",
          "label": "Acid accent on near-black",
          "value": "#8B5CF6 on #000000"
        }
      ],
      "severity": "medium"
    },
    {
      "id": "drift-token-bypass",
      "family": "drift",
      "detector": "TokenBypass",
      "verdictHint": "drift",
      "facts": {
        "offGridValues": [
          31,
          13,
          27,
          29,
          21,
          77,
          23,
          93,
          11,
          17,
          47
        ],
        "gridBase": 4
      },
      "evidence": [
        {
          "kind": "computed",
          "label": "Off-grid spacing literals",
          "value": "31px, 13px, 27px, 29px, 21px, 77px, 23px, 93px, 11px, 17px, 47px"
        }
      ],
      "severity": "medium"
    }
  ],
  "verdicts": [
    {
      "findingId": "tell-system-font",
      "verdict": "generic",
      "confidence": 0.72,
      "rationale": "SystemFontTell matches a common AI-built UI pattern. Tell can name it, show the evidence, and draft a more distinctive direction."
    },
    {
      "findingId": "tell-gradient-crutch",
      "verdict": "generic",
      "confidence": 0.72,
      "rationale": "GradientCrutchTell matches a common AI-built UI pattern. Tell can name it, show the evidence, and draft a more distinctive direction."
    },
    {
      "findingId": "tell-emoji-chrome",
      "verdict": "generic",
      "confidence": 0.72,
      "rationale": "EmojiChromeTell matches a common AI-built UI pattern. Tell can name it, show the evidence, and draft a more distinctive direction."
    },
    {
      "findingId": "tell-centered-everything",
      "verdict": "generic",
      "confidence": 0.72,
      "rationale": "CenteredEverythingTell matches a common AI-built UI pattern. Tell can name it, show the evidence, and draft a more distinctive direction."
    },
    {
      "findingId": "drift-focus-ring",
      "verdict": "drift",
      "confidence": 0.72,
      "rationale": "FocusRingInconsistency found inconsistent rendered values. Pick one semantic treatment before the surface keeps splitting."
    },
    {
      "findingId": "drift-type-scale",
      "verdict": "drift",
      "confidence": 0.72,
      "rationale": "TypeScaleDrift found inconsistent rendered values. Pick one semantic treatment before the surface keeps splitting."
    },
    {
      "findingId": "drift-spacing-chaos",
      "verdict": "drift",
      "confidence": 0.72,
      "rationale": "SpacingChaos found inconsistent rendered values. Pick one semantic treatment before the surface keeps splitting."
    },
    {
      "findingId": "drift-state-gap",
      "verdict": "drift",
      "confidence": 0.72,
      "rationale": "StateGap found inconsistent rendered values. Pick one semantic treatment before the surface keeps splitting."
    },
    {
      "findingId": "tell-acid-accent",
      "verdict": "generic",
      "confidence": 0.72,
      "rationale": "AcidAccentTell matches a common AI-built UI pattern. Tell can name it, show the evidence, and draft a more distinctive direction."
    },
    {
      "findingId": "drift-token-bypass",
      "verdict": "drift",
      "confidence": 0.72,
      "rationale": "TokenBypass found inconsistent rendered values. Pick one semantic treatment before the surface keeps splitting."
    }
  ],
  "score": {
    "total": 10,
    "generic": 5,
    "drift": 5,
    "intentional": 0,
    "uncertain": 0
  },
  "measures": {
    "score": 67,
    "band": "slop",
    "axes": [
      {
        "key": "contrast",
        "label": "Contrast & hierarchy",
        "weight": 0.2,
        "before": 0.9,
        "after": 0.9,
        "beforeText": "89% WCAG pass · hierarchy 6.9×",
        "afterText": "89% WCAG pass · hierarchy 6.9×",
        "rationale": ""
      },
      {
        "key": "typescale",
        "label": "Type scale",
        "weight": 0.15,
        "before": 0.3,
        "after": 0.3,
        "beforeText": "9 sizes · no clean ratio (best 1.2)",
        "afterText": "9 sizes · no clean ratio (best 1.2)",
        "rationale": ""
      },
      {
        "key": "spacing",
        "label": "Spacing rhythm",
        "weight": 0.15,
        "before": 0.3,
        "after": 0.3,
        "beforeText": "11 spacings · 0% on-grid",
        "afterText": "11 spacings · 0% on-grid",
        "rationale": ""
      },
      {
        "key": "depth",
        "label": "Depth restraint",
        "weight": 0.15,
        "before": 0,
        "after": 0,
        "beforeText": "1 shadow level · 63% of surfaces",
        "afterText": "1 shadow level · 63% of surfaces",
        "rationale": ""
      },
      {
        "key": "accent",
        "label": "Accent discipline",
        "weight": 0.2,
        "before": 0.2,
        "after": 0.2,
        "beforeText": "#8B5CF6 · 1 hue cluster · AI-default",
        "afterText": "#8B5CF6 · 1 hue cluster · AI-default",
        "rationale": ""
      },
      {
        "key": "identity",
        "label": "Type identity",
        "weight": 0.15,
        "before": 0.7,
        "after": 0.7,
        "beforeText": "2 families · sans+sans",
        "afterText": "2 families · sans+sans",
        "rationale": ""
      }
    ],
    "tellScore": 0.6,
    "scoredAgainst": "baseline"
  }
};
