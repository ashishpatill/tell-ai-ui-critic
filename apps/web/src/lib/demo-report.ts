// Auto-generated from fixtures/reports/tell-report.json (the deliberately-generic sample app).
// Real capture so the on-load demo shows a genuine scorecard + working before/after seam.
// Screenshot and probe PNGs omitted to keep the client bundle small; live capture fills them in.
// Regenerate: pnpm sync:demo-report
import type { TellReport } from "@tell/schema";

export const demoReport: TellReport = {
  "capture": {
    "url": "http://localhost:3001",
    "capturedAt": "2026-07-07T13:38:20.057Z",
    "viewport": {
      "width": 1440,
      "height": 1100
    },
    "screenshotBase64": "",
    "snapshotHtml": "<!DOCTYPE html><html lang=\"en\"><head><base href=\"http://localhost:3001/\"><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><link rel=\"stylesheet\" href=\"/_next/static/css/app/layout.css?v=1783431497897\" data-precedence=\"next_static/css/app/layout.css\"><style data-tell-inlined=\"\">body { margin: 0px; font-family: Inter, system-ui, sans-serif; background: rgb(15, 15, 15); color: rgb(244, 244, 245); }\nmain, section, header, footer { text-align: center; }\nbutton, a { border-radius: 8px; }\n.hero { padding: 77px 23px 93px; background: linear-gradient(135deg, rgb(139, 92, 246), rgb(236, 72, 153)); }\n.nav { display: flex; justify-content: center; gap: 19px; padding: 21px; }\n.nav a { color: rgb(243, 244, 246); text-decoration: none; box-shadow: rgba(0, 0, 0, 0.35) 0px 10px 25px; }\n.pill { display: inline-block; border-radius: 8px; padding: 11px 17px; background: rgb(17, 24, 39); box-shadow: rgba(0, 0, 0, 0.35) 0px 10px 25px; }\n.button { display: inline-block; margin: 23px 7px; padding: 13px 27px; background: rgb(139, 92, 246); color: white; border: 0px; text-decoration: none; box-shadow: rgba(0, 0, 0, 0.35) 0px 10px 25px; }\n.button.secondary { background: rgb(24, 24, 27); color: rgb(245, 245, 244); }\n.button.no-focus:focus { outline: none; }\n.cards { display: grid; max-width: 1080px; margin: 37px auto; grid-template-columns: repeat(3, 1fr); gap: 19px; padding: 0px 29px; }\n.card { border-radius: 8px; padding: 31px; background: rgb(17, 24, 39); box-shadow: rgba(0, 0, 0, 0.35) 0px 10px 25px; }\n.card:nth-child(2) { background: rgb(17, 24, 31); }\n.card:nth-child(3) { background: rgb(16, 22, 32); }\n.muted-a { color: rgb(244, 244, 244); }\n.muted-b { color: rgb(245, 245, 245); }\n.muted-c { color: rgb(246, 246, 246); }\n.muted-d { color: rgb(242, 242, 242); }\n.muted-e { color: rgb(243, 243, 243); }\n.mini-stats { display: flex; justify-content: center; flex-wrap: wrap; gap: 19px; padding: 31px 29px 47px; }\n.mini-stat { border-radius: 8px; padding: 17px 23px; background: rgb(17, 24, 39); box-shadow: rgba(0, 0, 0, 0.35) 0px 10px 25px; min-width: 120px; }\n.tag-row { display: flex; flex-wrap: wrap; justify-content: center; gap: 11px; padding: 23px 29px 41px; }\n.tag { display: inline-block; border-radius: 8px; padding: 9px 15px; background: rgb(17, 24, 39); box-shadow: rgba(0, 0, 0, 0.35) 0px 10px 25px; font-size: 14px; }\n.odd-type h2 { font-size: 29px; }\n.odd-type p:nth-child(2) { font-size: 15px; }\n.odd-type p:nth-child(3) { font-size: 19px; }\n.odd-type p:nth-child(4) { font-size: 22px; }\n.brutalist { font-family: \"IBM Plex Mono\", ui-monospace, monospace; background: rgb(243, 244, 246); color: rgb(17, 24, 39); padding: 88px 24px; text-align: left; }\n</style></head><body data-tell-id=\"t0\"><main data-tell-id=\"t1\"><div class=\"pill\">Demo input — deliberately generic. Not Tell's UI.</div><nav class=\"nav\" data-tell-id=\"t2\"><a href=\"#features\" data-tell-id=\"t3\">🚀 Features</a><a href=\"#metrics\" data-tell-id=\"t4\">📊 Metrics</a><a href=\"/brutalist\" data-tell-id=\"t5\">✨ Brutalist route</a></nav><header class=\"hero\" data-tell-id=\"t6\"><p class=\"pill\" data-tell-id=\"t7\">AI-powered analytics</p><h1 style=\"font-size:63px\" data-tell-id=\"t8\">Ship insights faster ✨</h1><p class=\"muted-a\" style=\"font-size:18px\" data-tell-id=\"t9\">A beautiful dashboard for modern teams.</p><a class=\"button no-focus\" href=\"#features\" data-tell-id=\"t10\">Get started 🚀</a><a class=\"button secondary\" href=\"#metrics\" data-tell-id=\"t11\">View dashboard 📊</a></header><section id=\"features\" class=\"cards odd-type\" data-tell-id=\"t12\"><article class=\"card\" data-tell-id=\"t13\"><h2 data-tell-id=\"t14\">Automate<!-- --> ✨</h2><p class=\"muted-b\" data-tell-id=\"t15\">Everything your team needs in one place.</p><p class=\"muted-c\" data-tell-id=\"t16\">Beautiful insights without the setup.</p><p class=\"muted-d\" data-tell-id=\"t17\">Built for modern workflows.</p><button class=\"button no-focus\" data-tell-id=\"t18\">Learn more</button></article><article class=\"card\" data-tell-id=\"t19\"><h2 data-tell-id=\"t20\">Analyze<!-- --> ✨</h2><p class=\"muted-b\" data-tell-id=\"t21\">Everything your team needs in one place.</p><p class=\"muted-c\" data-tell-id=\"t22\">Beautiful insights without the setup.</p><p class=\"muted-d\" data-tell-id=\"t23\">Built for modern workflows.</p><button class=\"button\" data-tell-id=\"t24\">Learn more</button></article><article class=\"card\" data-tell-id=\"t25\"><h2 data-tell-id=\"t26\">Scale<!-- --> ✨</h2><p class=\"muted-b\" data-tell-id=\"t27\">Everything your team needs in one place.</p><p class=\"muted-c\" data-tell-id=\"t28\">Beautiful insights without the setup.</p><p class=\"muted-d\" data-tell-id=\"t29\">Built for modern workflows.</p><button class=\"button\" data-tell-id=\"t30\">Learn more</button></article></section><section id=\"metrics\" class=\"cards\" data-tell-id=\"t31\"><article class=\"card\" data-tell-id=\"t32\"><h2 style=\"font-size:41px\" data-tell-id=\"t33\">98%</h2><p class=\"muted-e\" data-tell-id=\"t34\">Metric that looks important.</p></article><article class=\"card\" data-tell-id=\"t35\"><h2 style=\"font-size:41px\" data-tell-id=\"t36\">24k</h2><p class=\"muted-e\" data-tell-id=\"t37\">Metric that looks important.</p></article><article class=\"card\" data-tell-id=\"t38\"><h2 style=\"font-size:41px\" data-tell-id=\"t39\">3.2x</h2><p class=\"muted-e\" data-tell-id=\"t40\">Metric that looks important.</p></article></section><section class=\"mini-stats\" aria-label=\"Extra chrome\" data-tell-id=\"t41\"><div class=\"mini-stat\" data-tell-id=\"t42\"><p class=\"muted-a\" style=\"font-size:17px\" data-tell-id=\"t43\">Latency</p><p class=\"muted-b\" style=\"font-size:21px\" data-tell-id=\"t44\">99.9%</p></div><div class=\"mini-stat\" data-tell-id=\"t45\"><p class=\"muted-a\" style=\"font-size:17px\" data-tell-id=\"t46\">Uptime</p><p class=\"muted-b\" style=\"font-size:21px\" data-tell-id=\"t47\">99.9%</p></div><div class=\"mini-stat\" data-tell-id=\"t48\"><p class=\"muted-a\" style=\"font-size:17px\" data-tell-id=\"t49\">Teams</p><p class=\"muted-b\" style=\"font-size:21px\" data-tell-id=\"t50\">99.9%</p></div><div class=\"mini-stat\" data-tell-id=\"t51\"><p class=\"muted-a\" style=\"font-size:17px\" data-tell-id=\"t52\">Regions</p><p class=\"muted-b\" style=\"font-size:21px\" data-tell-id=\"t53\">99.9%</p></div><div class=\"mini-stat\" data-tell-id=\"t54\"><p class=\"muted-a\" style=\"font-size:17px\" data-tell-id=\"t55\">Exports</p><p class=\"muted-b\" style=\"font-size:21px\" data-tell-id=\"t56\">99.9%</p></div><div class=\"mini-stat\" data-tell-id=\"t57\"><p class=\"muted-a\" style=\"font-size:17px\" data-tell-id=\"t58\">Alerts</p><p class=\"muted-b\" style=\"font-size:21px\" data-tell-id=\"t59\">99.9%</p></div></section><section class=\"tag-row\" aria-label=\"Tag chrome\" data-tell-id=\"t60\"><span class=\"tag\" data-tell-id=\"t61\">Realtime</span><span class=\"tag\" data-tell-id=\"t62\">Secure</span><span class=\"tag\" data-tell-id=\"t63\">Fast</span><span class=\"tag\" data-tell-id=\"t64\">Global</span><span class=\"tag\" data-tell-id=\"t65\">Trusted</span><span class=\"tag\" data-tell-id=\"t66\">Simple</span><span class=\"tag\" data-tell-id=\"t67\">Modern</span><span class=\"tag\" data-tell-id=\"t68\">Flexible</span><span class=\"tag\" data-tell-id=\"t69\">Reliable</span><span class=\"tag\" data-tell-id=\"t70\">Smart</span><span class=\"tag\" data-tell-id=\"t71\">Scalable</span><span class=\"tag\" data-tell-id=\"t72\">Open</span><span class=\"tag\" data-tell-id=\"t73\">Synced</span><span class=\"tag\" data-tell-id=\"t74\">Guided</span><span class=\"tag\" data-tell-id=\"t75\">Pro</span><span class=\"tag\" data-tell-id=\"t76\">Live</span><span class=\"tag\" data-tell-id=\"t77\">Beta</span><span class=\"tag\" data-tell-id=\"t78\">Core</span><span class=\"tag\" data-tell-id=\"t79\">Edge</span><span class=\"tag\" data-tell-id=\"t80\">Plus</span></section><footer style=\"padding:47px\" data-tell-id=\"t81\">Made with AI. Looks familiar.</footer></main><next-route-announcer style=\"position: absolute;\"></next-route-announcer></body></html>",
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
          "h": 1873
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
          "h": 1873
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
          "y": 42,
          "w": 1440,
          "h": 62
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
          "x": 550,
          "y": 63,
          "w": 90,
          "h": 20
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "16px",
        "fontWeight": "400",
        "color": "rgb(243, 244, 246)",
        "backgroundColor": "rgba(0, 0, 0, 0)",
        "borderRadius": "8px",
        "boxShadow": "rgba(0, 0, 0, 0.35) 0px 10px 25px 0px",
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
          "x": 659,
          "y": 63,
          "w": 81,
          "h": 20
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "16px",
        "fontWeight": "400",
        "color": "rgb(243, 244, 246)",
        "backgroundColor": "rgba(0, 0, 0, 0)",
        "borderRadius": "8px",
        "boxShadow": "rgba(0, 0, 0, 0.35) 0px 10px 25px 0px",
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
          "x": 760,
          "y": 63,
          "w": 130,
          "h": 20
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "16px",
        "fontWeight": "400",
        "color": "rgb(243, 244, 246)",
        "backgroundColor": "rgba(0, 0, 0, 0)",
        "borderRadius": "8px",
        "boxShadow": "rgba(0, 0, 0, 0.35) 0px 10px 25px 0px",
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
          "y": 104,
          "w": 1440,
          "h": 535
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
          "x": 623,
          "y": 197,
          "w": 195,
          "h": 42
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
          "y": 297,
          "w": 1394,
          "h": 76
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
          "y": 415,
          "w": 1394,
          "h": 21
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "18px",
        "fontWeight": "400",
        "color": "rgb(244, 244, 244)",
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
          "x": 531,
          "y": 477,
          "w": 163,
          "h": 46
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
          "x": 708,
          "y": 477,
          "w": 201,
          "h": 46
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
          "y": 676,
          "w": 1138,
          "h": 431
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
          "y": 676,
          "w": 347,
          "h": 431
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
          "y": 731,
          "w": 285,
          "h": 35
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
          "y": 791,
          "w": 285,
          "h": 38
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "15px",
        "fontWeight": "400",
        "color": "rgb(245, 245, 245)",
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
          "y": 848,
          "w": 285,
          "h": 46
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "19px",
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
        "selector": "p.muted-d",
        "tellId": "t17",
        "tag": "p",
        "role": "heading",
        "rect": {
          "x": 211,
          "y": 916,
          "w": 285,
          "h": 52
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
          "y": 1013,
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
          "y": 676,
          "w": 347,
          "h": 431
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
          "y": 731,
          "w": 285,
          "h": 35
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
          "y": 791,
          "w": 285,
          "h": 38
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "15px",
        "fontWeight": "400",
        "color": "rgb(245, 245, 245)",
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
          "y": 848,
          "w": 285,
          "h": 46
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "19px",
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
        "selector": "p.muted-d",
        "tellId": "t23",
        "tag": "p",
        "role": "heading",
        "rect": {
          "x": 577,
          "y": 916,
          "w": 285,
          "h": 52
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
          "y": 1013,
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
          "y": 676,
          "w": 347,
          "h": 431
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
          "y": 731,
          "w": 285,
          "h": 35
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
          "y": 791,
          "w": 285,
          "h": 38
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "15px",
        "fontWeight": "400",
        "color": "rgb(245, 245, 245)",
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
          "y": 848,
          "w": 285,
          "h": 46
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "19px",
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
        "selector": "p.muted-d",
        "tellId": "t29",
        "tag": "p",
        "role": "heading",
        "rect": {
          "x": 944,
          "y": 916,
          "w": 285,
          "h": 52
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
          "y": 1013,
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
          "y": 1145,
          "w": 1138,
          "h": 216
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
          "y": 1145,
          "w": 347,
          "h": 216
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
          "y": 1210,
          "w": 285,
          "h": 50
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
          "y": 1294,
          "w": 285,
          "h": 20
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "16px",
        "fontWeight": "400",
        "color": "rgb(243, 243, 243)",
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
          "y": 1145,
          "w": 347,
          "h": 216
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
          "y": 1210,
          "w": 285,
          "h": 50
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
          "y": 1294,
          "w": 285,
          "h": 20
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "16px",
        "fontWeight": "400",
        "color": "rgb(243, 243, 243)",
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
          "y": 1145,
          "w": 347,
          "h": 216
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
          "y": 1210,
          "w": 285,
          "h": 50
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
          "y": 1294,
          "w": 285,
          "h": 20
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "16px",
        "fontWeight": "400",
        "color": "rgb(243, 243, 243)",
        "backgroundColor": "rgba(0, 0, 0, 0)",
        "borderRadius": "0px",
        "boxShadow": "none",
        "padding": "0px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "section.mini-stats",
        "tellId": "t41",
        "tag": "section",
        "role": "surface",
        "rect": {
          "x": 0,
          "y": 1398,
          "w": 1440,
          "h": 216
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "16px",
        "fontWeight": "400",
        "color": "rgb(244, 244, 245)",
        "backgroundColor": "rgba(0, 0, 0, 0)",
        "borderRadius": "0px",
        "boxShadow": "none",
        "padding": "31px 29px 47px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "div.mini-stat",
        "tellId": "t42",
        "tag": "div",
        "role": "other",
        "rect": {
          "x": 175,
          "y": 1429,
          "w": 166,
          "h": 138
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "16px",
        "fontWeight": "400",
        "color": "rgb(244, 244, 245)",
        "backgroundColor": "rgb(17, 24, 39)",
        "borderRadius": "8px",
        "boxShadow": "rgba(0, 0, 0, 0.35) 0px 10px 25px 0px",
        "padding": "17px 23px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "p.muted-a",
        "tellId": "t43",
        "tag": "p",
        "role": "body",
        "rect": {
          "x": 198,
          "y": 1463,
          "w": 120,
          "h": 20
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "17px",
        "fontWeight": "400",
        "color": "rgb(244, 244, 244)",
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
        "tellId": "t44",
        "tag": "p",
        "role": "body",
        "rect": {
          "x": 198,
          "y": 1504,
          "w": 120,
          "h": 25
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "21px",
        "fontWeight": "400",
        "color": "rgb(245, 245, 245)",
        "backgroundColor": "rgba(0, 0, 0, 0)",
        "borderRadius": "0px",
        "boxShadow": "none",
        "padding": "0px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "div.mini-stat",
        "tellId": "t45",
        "tag": "div",
        "role": "other",
        "rect": {
          "x": 360,
          "y": 1429,
          "w": 166,
          "h": 138
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "16px",
        "fontWeight": "400",
        "color": "rgb(244, 244, 245)",
        "backgroundColor": "rgb(17, 24, 39)",
        "borderRadius": "8px",
        "boxShadow": "rgba(0, 0, 0, 0.35) 0px 10px 25px 0px",
        "padding": "17px 23px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "p.muted-a",
        "tellId": "t46",
        "tag": "p",
        "role": "body",
        "rect": {
          "x": 383,
          "y": 1463,
          "w": 120,
          "h": 20
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "17px",
        "fontWeight": "400",
        "color": "rgb(244, 244, 244)",
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
        "tellId": "t47",
        "tag": "p",
        "role": "body",
        "rect": {
          "x": 383,
          "y": 1504,
          "w": 120,
          "h": 25
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "21px",
        "fontWeight": "400",
        "color": "rgb(245, 245, 245)",
        "backgroundColor": "rgba(0, 0, 0, 0)",
        "borderRadius": "0px",
        "boxShadow": "none",
        "padding": "0px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "div.mini-stat",
        "tellId": "t48",
        "tag": "div",
        "role": "other",
        "rect": {
          "x": 545,
          "y": 1429,
          "w": 166,
          "h": 138
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "16px",
        "fontWeight": "400",
        "color": "rgb(244, 244, 245)",
        "backgroundColor": "rgb(17, 24, 39)",
        "borderRadius": "8px",
        "boxShadow": "rgba(0, 0, 0, 0.35) 0px 10px 25px 0px",
        "padding": "17px 23px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "p.muted-a",
        "tellId": "t49",
        "tag": "p",
        "role": "body",
        "rect": {
          "x": 568,
          "y": 1463,
          "w": 120,
          "h": 20
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "17px",
        "fontWeight": "400",
        "color": "rgb(244, 244, 244)",
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
        "tellId": "t50",
        "tag": "p",
        "role": "body",
        "rect": {
          "x": 568,
          "y": 1504,
          "w": 120,
          "h": 25
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "21px",
        "fontWeight": "400",
        "color": "rgb(245, 245, 245)",
        "backgroundColor": "rgba(0, 0, 0, 0)",
        "borderRadius": "0px",
        "boxShadow": "none",
        "padding": "0px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "div.mini-stat",
        "tellId": "t51",
        "tag": "div",
        "role": "other",
        "rect": {
          "x": 730,
          "y": 1429,
          "w": 166,
          "h": 138
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "16px",
        "fontWeight": "400",
        "color": "rgb(244, 244, 245)",
        "backgroundColor": "rgb(17, 24, 39)",
        "borderRadius": "8px",
        "boxShadow": "rgba(0, 0, 0, 0.35) 0px 10px 25px 0px",
        "padding": "17px 23px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "p.muted-a",
        "tellId": "t52",
        "tag": "p",
        "role": "body",
        "rect": {
          "x": 753,
          "y": 1463,
          "w": 120,
          "h": 20
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "17px",
        "fontWeight": "400",
        "color": "rgb(244, 244, 244)",
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
        "tellId": "t53",
        "tag": "p",
        "role": "body",
        "rect": {
          "x": 753,
          "y": 1504,
          "w": 120,
          "h": 25
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "21px",
        "fontWeight": "400",
        "color": "rgb(245, 245, 245)",
        "backgroundColor": "rgba(0, 0, 0, 0)",
        "borderRadius": "0px",
        "boxShadow": "none",
        "padding": "0px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "div.mini-stat",
        "tellId": "t54",
        "tag": "div",
        "role": "other",
        "rect": {
          "x": 915,
          "y": 1429,
          "w": 166,
          "h": 138
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "16px",
        "fontWeight": "400",
        "color": "rgb(244, 244, 245)",
        "backgroundColor": "rgb(17, 24, 39)",
        "borderRadius": "8px",
        "boxShadow": "rgba(0, 0, 0, 0.35) 0px 10px 25px 0px",
        "padding": "17px 23px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "p.muted-a",
        "tellId": "t55",
        "tag": "p",
        "role": "body",
        "rect": {
          "x": 938,
          "y": 1463,
          "w": 120,
          "h": 20
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "17px",
        "fontWeight": "400",
        "color": "rgb(244, 244, 244)",
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
        "tellId": "t56",
        "tag": "p",
        "role": "body",
        "rect": {
          "x": 938,
          "y": 1504,
          "w": 120,
          "h": 25
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "21px",
        "fontWeight": "400",
        "color": "rgb(245, 245, 245)",
        "backgroundColor": "rgba(0, 0, 0, 0)",
        "borderRadius": "0px",
        "boxShadow": "none",
        "padding": "0px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "div.mini-stat",
        "tellId": "t57",
        "tag": "div",
        "role": "other",
        "rect": {
          "x": 1100,
          "y": 1429,
          "w": 166,
          "h": 138
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "16px",
        "fontWeight": "400",
        "color": "rgb(244, 244, 245)",
        "backgroundColor": "rgb(17, 24, 39)",
        "borderRadius": "8px",
        "boxShadow": "rgba(0, 0, 0, 0.35) 0px 10px 25px 0px",
        "padding": "17px 23px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "p.muted-a",
        "tellId": "t58",
        "tag": "p",
        "role": "body",
        "rect": {
          "x": 1123,
          "y": 1463,
          "w": 120,
          "h": 20
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "17px",
        "fontWeight": "400",
        "color": "rgb(244, 244, 244)",
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
        "tellId": "t59",
        "tag": "p",
        "role": "body",
        "rect": {
          "x": 1123,
          "y": 1504,
          "w": 120,
          "h": 25
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "21px",
        "fontWeight": "400",
        "color": "rgb(245, 245, 245)",
        "backgroundColor": "rgba(0, 0, 0, 0)",
        "borderRadius": "0px",
        "boxShadow": "none",
        "padding": "0px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "section.tag-row",
        "tellId": "t60",
        "tag": "section",
        "role": "surface",
        "rect": {
          "x": 0,
          "y": 1614,
          "w": 1440,
          "h": 145
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "16px",
        "fontWeight": "400",
        "color": "rgb(244, 244, 245)",
        "backgroundColor": "rgba(0, 0, 0, 0)",
        "borderRadius": "0px",
        "boxShadow": "none",
        "padding": "23px 29px 41px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "span.tag",
        "tellId": "t61",
        "tag": "span",
        "role": "other",
        "rect": {
          "x": 47,
          "y": 1637,
          "w": 87,
          "h": 35
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "14px",
        "fontWeight": "400",
        "color": "rgb(244, 244, 245)",
        "backgroundColor": "rgb(17, 24, 39)",
        "borderRadius": "8px",
        "boxShadow": "rgba(0, 0, 0, 0.35) 0px 10px 25px 0px",
        "padding": "9px 15px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "span.tag",
        "tellId": "t62",
        "tag": "span",
        "role": "other",
        "rect": {
          "x": 145,
          "y": 1637,
          "w": 77,
          "h": 35
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "14px",
        "fontWeight": "400",
        "color": "rgb(244, 244, 245)",
        "backgroundColor": "rgb(17, 24, 39)",
        "borderRadius": "8px",
        "boxShadow": "rgba(0, 0, 0, 0.35) 0px 10px 25px 0px",
        "padding": "9px 15px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "span.tag",
        "tellId": "t63",
        "tag": "span",
        "role": "other",
        "rect": {
          "x": 233,
          "y": 1637,
          "w": 58,
          "h": 35
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "14px",
        "fontWeight": "400",
        "color": "rgb(244, 244, 245)",
        "backgroundColor": "rgb(17, 24, 39)",
        "borderRadius": "8px",
        "boxShadow": "rgba(0, 0, 0, 0.35) 0px 10px 25px 0px",
        "padding": "9px 15px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "span.tag",
        "tellId": "t64",
        "tag": "span",
        "role": "other",
        "rect": {
          "x": 302,
          "y": 1637,
          "w": 72,
          "h": 35
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "14px",
        "fontWeight": "400",
        "color": "rgb(244, 244, 245)",
        "backgroundColor": "rgb(17, 24, 39)",
        "borderRadius": "8px",
        "boxShadow": "rgba(0, 0, 0, 0.35) 0px 10px 25px 0px",
        "padding": "9px 15px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "span.tag",
        "tellId": "t65",
        "tag": "span",
        "role": "other",
        "rect": {
          "x": 385,
          "y": 1637,
          "w": 80,
          "h": 35
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "14px",
        "fontWeight": "400",
        "color": "rgb(244, 244, 245)",
        "backgroundColor": "rgb(17, 24, 39)",
        "borderRadius": "8px",
        "boxShadow": "rgba(0, 0, 0, 0.35) 0px 10px 25px 0px",
        "padding": "9px 15px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "span.tag",
        "tellId": "t66",
        "tag": "span",
        "role": "other",
        "rect": {
          "x": 476,
          "y": 1637,
          "w": 75,
          "h": 35
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "14px",
        "fontWeight": "400",
        "color": "rgb(244, 244, 245)",
        "backgroundColor": "rgb(17, 24, 39)",
        "borderRadius": "8px",
        "boxShadow": "rgba(0, 0, 0, 0.35) 0px 10px 25px 0px",
        "padding": "9px 15px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "span.tag",
        "tellId": "t67",
        "tag": "span",
        "role": "other",
        "rect": {
          "x": 562,
          "y": 1637,
          "w": 82,
          "h": 35
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "14px",
        "fontWeight": "400",
        "color": "rgb(244, 244, 245)",
        "backgroundColor": "rgb(17, 24, 39)",
        "borderRadius": "8px",
        "boxShadow": "rgba(0, 0, 0, 0.35) 0px 10px 25px 0px",
        "padding": "9px 15px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "span.tag",
        "tellId": "t68",
        "tag": "span",
        "role": "other",
        "rect": {
          "x": 654,
          "y": 1637,
          "w": 81,
          "h": 35
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "14px",
        "fontWeight": "400",
        "color": "rgb(244, 244, 245)",
        "backgroundColor": "rgb(17, 24, 39)",
        "borderRadius": "8px",
        "boxShadow": "rgba(0, 0, 0, 0.35) 0px 10px 25px 0px",
        "padding": "9px 15px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "span.tag",
        "tellId": "t69",
        "tag": "span",
        "role": "other",
        "rect": {
          "x": 746,
          "y": 1637,
          "w": 82,
          "h": 35
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "14px",
        "fontWeight": "400",
        "color": "rgb(244, 244, 245)",
        "backgroundColor": "rgb(17, 24, 39)",
        "borderRadius": "8px",
        "boxShadow": "rgba(0, 0, 0, 0.35) 0px 10px 25px 0px",
        "padding": "9px 15px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "span.tag",
        "tellId": "t70",
        "tag": "span",
        "role": "other",
        "rect": {
          "x": 839,
          "y": 1637,
          "w": 69,
          "h": 35
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "14px",
        "fontWeight": "400",
        "color": "rgb(244, 244, 245)",
        "backgroundColor": "rgb(17, 24, 39)",
        "borderRadius": "8px",
        "boxShadow": "rgba(0, 0, 0, 0.35) 0px 10px 25px 0px",
        "padding": "9px 15px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "span.tag",
        "tellId": "t71",
        "tag": "span",
        "role": "other",
        "rect": {
          "x": 919,
          "y": 1637,
          "w": 86,
          "h": 35
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "14px",
        "fontWeight": "400",
        "color": "rgb(244, 244, 245)",
        "backgroundColor": "rgb(17, 24, 39)",
        "borderRadius": "8px",
        "boxShadow": "rgba(0, 0, 0, 0.35) 0px 10px 25px 0px",
        "padding": "9px 15px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "span.tag",
        "tellId": "t72",
        "tag": "span",
        "role": "other",
        "rect": {
          "x": 1016,
          "y": 1637,
          "w": 66,
          "h": 35
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "14px",
        "fontWeight": "400",
        "color": "rgb(244, 244, 245)",
        "backgroundColor": "rgb(17, 24, 39)",
        "borderRadius": "8px",
        "boxShadow": "rgba(0, 0, 0, 0.35) 0px 10px 25px 0px",
        "padding": "9px 15px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "span.tag",
        "tellId": "t73",
        "tag": "span",
        "role": "other",
        "rect": {
          "x": 1093,
          "y": 1637,
          "w": 80,
          "h": 35
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "14px",
        "fontWeight": "400",
        "color": "rgb(244, 244, 245)",
        "backgroundColor": "rgb(17, 24, 39)",
        "borderRadius": "8px",
        "boxShadow": "rgba(0, 0, 0, 0.35) 0px 10px 25px 0px",
        "padding": "9px 15px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "span.tag",
        "tellId": "t74",
        "tag": "span",
        "role": "other",
        "rect": {
          "x": 1184,
          "y": 1637,
          "w": 77,
          "h": 35
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "14px",
        "fontWeight": "400",
        "color": "rgb(244, 244, 245)",
        "backgroundColor": "rgb(17, 24, 39)",
        "borderRadius": "8px",
        "boxShadow": "rgba(0, 0, 0, 0.35) 0px 10px 25px 0px",
        "padding": "9px 15px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "span.tag",
        "tellId": "t75",
        "tag": "span",
        "role": "other",
        "rect": {
          "x": 1272,
          "y": 1637,
          "w": 52,
          "h": 35
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "14px",
        "fontWeight": "400",
        "color": "rgb(244, 244, 245)",
        "backgroundColor": "rgb(17, 24, 39)",
        "borderRadius": "8px",
        "boxShadow": "rgba(0, 0, 0, 0.35) 0px 10px 25px 0px",
        "padding": "9px 15px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "span.tag",
        "tellId": "t76",
        "tag": "span",
        "role": "other",
        "rect": {
          "x": 1336,
          "y": 1637,
          "w": 57,
          "h": 35
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "14px",
        "fontWeight": "400",
        "color": "rgb(244, 244, 245)",
        "backgroundColor": "rgb(17, 24, 39)",
        "borderRadius": "8px",
        "boxShadow": "rgba(0, 0, 0, 0.35) 0px 10px 25px 0px",
        "padding": "9px 15px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "span.tag",
        "tellId": "t77",
        "tag": "span",
        "role": "other",
        "rect": {
          "x": 582,
          "y": 1683,
          "w": 60,
          "h": 35
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "14px",
        "fontWeight": "400",
        "color": "rgb(244, 244, 245)",
        "backgroundColor": "rgb(17, 24, 39)",
        "borderRadius": "8px",
        "boxShadow": "rgba(0, 0, 0, 0.35) 0px 10px 25px 0px",
        "padding": "9px 15px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "span.tag",
        "tellId": "t78",
        "tag": "span",
        "role": "other",
        "rect": {
          "x": 653,
          "y": 1683,
          "w": 62,
          "h": 35
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "14px",
        "fontWeight": "400",
        "color": "rgb(244, 244, 245)",
        "backgroundColor": "rgb(17, 24, 39)",
        "borderRadius": "8px",
        "boxShadow": "rgba(0, 0, 0, 0.35) 0px 10px 25px 0px",
        "padding": "9px 15px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "span.tag",
        "tellId": "t79",
        "tag": "span",
        "role": "other",
        "rect": {
          "x": 725,
          "y": 1683,
          "w": 64,
          "h": 35
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "14px",
        "fontWeight": "400",
        "color": "rgb(244, 244, 245)",
        "backgroundColor": "rgb(17, 24, 39)",
        "borderRadius": "8px",
        "boxShadow": "rgba(0, 0, 0, 0.35) 0px 10px 25px 0px",
        "padding": "9px 15px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "span.tag",
        "tellId": "t80",
        "tag": "span",
        "role": "other",
        "rect": {
          "x": 800,
          "y": 1683,
          "w": 58,
          "h": 35
        },
        "fontFamily": "Inter, system-ui, sans-serif",
        "fontSize": "14px",
        "fontWeight": "400",
        "color": "rgb(244, 244, 245)",
        "backgroundColor": "rgb(17, 24, 39)",
        "borderRadius": "8px",
        "boxShadow": "rgba(0, 0, 0, 0.35) 0px 10px 25px 0px",
        "padding": "9px 15px",
        "textAlign": "center",
        "lineHeight": "normal",
        "backgroundImage": "none"
      },
      {
        "selector": "footer",
        "tellId": "t81",
        "tag": "footer",
        "role": "surface",
        "rect": {
          "x": 0,
          "y": 1759,
          "w": 1440,
          "h": 114
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
    "stateShots": [
      {
        "selector": "a:nth-of-type(1)",
        "state": "default",
        "imageBase64": ""
      },
      {
        "selector": "a:nth-of-type(1)",
        "state": "hover",
        "imageBase64": ""
      },
      {
        "selector": "a:nth-of-type(1)",
        "state": "focus",
        "imageBase64": ""
      },
      {
        "selector": "a:nth-of-type(2)",
        "state": "default",
        "imageBase64": ""
      },
      {
        "selector": "a:nth-of-type(2)",
        "state": "hover",
        "imageBase64": ""
      },
      {
        "selector": "a:nth-of-type(2)",
        "state": "focus",
        "imageBase64": ""
      },
      {
        "selector": "a:nth-of-type(3)",
        "state": "default",
        "imageBase64": ""
      },
      {
        "selector": "a:nth-of-type(3)",
        "state": "hover",
        "imageBase64": ""
      },
      {
        "selector": "a:nth-of-type(3)",
        "state": "focus",
        "imageBase64": ""
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
    "generatedAt": "2026-07-07T13:45:06.932Z",
    "fontFamilies": [
      {
        "family": "Inter",
        "count": 79,
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
          "section.mini-stats",
          "div.mini-stat",
          "section.tag-row",
          "span.tag",
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
        "value": "rgb(244, 244, 245)",
        "count": 49,
        "normalizedHex": "#F4F4F5"
      },
      {
        "value": "rgba(0, 0, 0, 0)",
        "count": 43,
        "normalizedHex": "#000000"
      },
      {
        "value": "rgb(17, 24, 39)",
        "count": 29,
        "normalizedHex": "#111827"
      },
      {
        "value": "rgb(245, 245, 245)",
        "count": 9,
        "normalizedHex": "#F5F5F5"
      },
      {
        "value": "rgb(244, 244, 244)",
        "count": 7,
        "normalizedHex": "#F4F4F4"
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
        "value": "rgb(243, 244, 246)",
        "count": 3,
        "normalizedHex": "#F3F4F6"
      },
      {
        "value": "rgb(246, 246, 246)",
        "count": 3,
        "normalizedHex": "#F6F6F6"
      },
      {
        "value": "rgb(242, 242, 242)",
        "count": 3,
        "normalizedHex": "#F2F2F2"
      },
      {
        "value": "rgb(243, 243, 243)",
        "count": 3,
        "normalizedHex": "#F3F3F3"
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
        "value": "rgb(245, 245, 244)",
        "count": 1,
        "normalizedHex": "#F5F5F4"
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
        "count": 41
      },
      {
        "value": "rgba(0, 0, 0, 0.35) 0px 10px 25px 0px",
        "count": 41
      }
    ],
    "radii": [
      {
        "value": "0px",
        "count": 41
      },
      {
        "value": "8px",
        "count": 41
      }
    ],
    "spacingValues": [
      {
        "value": "0px",
        "count": 37
      },
      {
        "value": "9px 15px",
        "count": 20
      },
      {
        "value": "31px",
        "count": 6
      },
      {
        "value": "17px 23px",
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
        "value": "31px 29px 47px",
        "count": 1
      },
      {
        "value": "23px 29px 41px",
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
        "count": 30,
        "roles": []
      },
      {
        "size": "14px",
        "count": 20,
        "roles": []
      },
      {
        "size": "17px",
        "count": 6,
        "roles": []
      },
      {
        "size": "21px",
        "count": 6,
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
    "nearDuplicateGrays": [
      {
        "values": [
          "#F4F4F5",
          "#F5F5F5",
          "#F4F4F4",
          "#F6F6F6",
          "#F2F2F2",
          "#F3F3F3",
          "#F5F5F4"
        ],
        "deltaE": 1.4
      }
    ],
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
        "ratio": 0.9634146341463414,
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
          "section.mini-stats",
          "div.mini-stat",
          "section.tag-row",
          "span.tag",
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
      "id": "tell-shadow-everywhere",
      "family": "tell",
      "detector": "ShadowEverywhereTell",
      "verdictHint": "generic",
      "facts": {
        "shadow": "rgba(0, 0, 0, 0.35) 0px 10px 25px 0px",
        "count": 41
      },
      "evidence": [
        {
          "kind": "computed",
          "label": "Repeated shadow",
          "value": "rgba(0, 0, 0, 0.35) 0px 10px 25px 0px"
        }
      ],
      "severity": "medium"
    },
    {
      "id": "tell-radius-monotone",
      "family": "tell",
      "detector": "RadiusMonotoneTell",
      "verdictHint": "generic",
      "facts": {
        "radius": "8px",
        "count": 41
      },
      "evidence": [
        {
          "kind": "computed",
          "label": "Repeated radius",
          "value": "8px"
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
      "id": "tell-gray-mush",
      "family": "tell",
      "detector": "GrayMushTell",
      "verdictHint": "generic",
      "facts": {
        "clusters": [
          {
            "values": [
              "#F4F4F5",
              "#F5F5F5",
              "#F4F4F4",
              "#F6F6F6",
              "#F2F2F2",
              "#F3F3F3",
              "#F5F5F4"
            ],
            "deltaE": 1.4
          }
        ]
      },
      "evidence": [
        {
          "kind": "computed",
          "label": "Near-duplicate grays",
          "value": "#F4F4F5, #F5F5F5, #F4F4F4, #F6F6F6, #F2F2F2, #F3F3F3, #F5F5F4"
        }
      ],
      "severity": "medium"
    },
    {
      "id": "drift-near-duplicate-values",
      "family": "drift",
      "detector": "NearDuplicateValues",
      "verdictHint": "drift",
      "facts": {
        "clusters": [
          {
            "values": [
              "#F4F4F5",
              "#F5F5F5",
              "#F4F4F4",
              "#F6F6F6",
              "#F2F2F2",
              "#F3F3F3",
              "#F5F5F4"
            ],
            "deltaE": 1.4
          }
        ]
      },
      "evidence": [
        {
          "kind": "computed",
          "label": "Duplicate neutral values",
          "value": "#F4F4F5, #F5F5F5, #F4F4F4, #F6F6F6, #F2F2F2, #F3F3F3, #F5F5F4"
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
          "14px",
          "17px",
          "21px",
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
          "value": "16px, 14px, 17px, 21px, 29px, 15px, 19px, 22px, 13.3333px, 41px, 63px, 18px"
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
          "9px 15px",
          "31px",
          "17px 23px",
          "13px 27px",
          "0px 29px",
          "21px",
          "77px 23px 93px",
          "11px 17px",
          "31px 29px 47px",
          "23px 29px 41px",
          "47px"
        ]
      },
      "evidence": [
        {
          "kind": "computed",
          "label": "Spacing values",
          "value": "0px, 9px 15px, 31px, 17px 23px, 13px 27px, 0px 29px, 21px, 77px 23px 93px, 11px 17px, 31px 29px 47px, 23px 29px 41px, 47px"
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
          9,
          15,
          31,
          17,
          23,
          13,
          27,
          29,
          21,
          77,
          93,
          11,
          47,
          41
        ],
        "gridBase": 4
      },
      "evidence": [
        {
          "kind": "computed",
          "label": "Off-grid spacing literals",
          "value": "9px, 15px, 31px, 17px, 23px, 13px, 27px, 29px, 21px, 77px, 93px, 11px, 47px, 41px"
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
      "findingId": "tell-shadow-everywhere",
      "verdict": "generic",
      "confidence": 0.72,
      "rationale": "ShadowEverywhereTell matches a common AI-built UI pattern. Tell can name it, show the evidence, and draft a more distinctive direction."
    },
    {
      "findingId": "tell-radius-monotone",
      "verdict": "generic",
      "confidence": 0.72,
      "rationale": "RadiusMonotoneTell matches a common AI-built UI pattern. Tell can name it, show the evidence, and draft a more distinctive direction."
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
      "findingId": "tell-gray-mush",
      "verdict": "generic",
      "confidence": 0.72,
      "rationale": "GrayMushTell matches a common AI-built UI pattern. Tell can name it, show the evidence, and draft a more distinctive direction."
    },
    {
      "findingId": "drift-near-duplicate-values",
      "verdict": "drift",
      "confidence": 0.72,
      "rationale": "NearDuplicateValues found inconsistent rendered values. Pick one semantic treatment before the surface keeps splitting."
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
    "total": 14,
    "generic": 8,
    "drift": 6,
    "intentional": 0,
    "uncertain": 0
  },
  "measures": {
    "score": 76,
    "band": "slop",
    "axes": [
      {
        "key": "contrast",
        "label": "Contrast & hierarchy",
        "weight": 0.2,
        "before": 0.6,
        "after": 0.6,
        "beforeText": "93% WCAG pass · hierarchy 6.5× · gray-mush",
        "afterText": "93% WCAG pass · hierarchy 6.5× · gray-mush",
        "rationale": ""
      },
      {
        "key": "typescale",
        "label": "Type scale",
        "weight": 0.15,
        "before": 0.3,
        "after": 0.3,
        "beforeText": "11 sizes · no clean ratio (best 1.25)",
        "afterText": "11 sizes · no clean ratio (best 1.25)",
        "rationale": ""
      },
      {
        "key": "spacing",
        "label": "Spacing rhythm",
        "weight": 0.15,
        "before": 0.1,
        "after": 0.1,
        "beforeText": "14 spacings · 0% on-grid",
        "afterText": "14 spacings · 0% on-grid",
        "rationale": ""
      },
      {
        "key": "depth",
        "label": "Depth restraint",
        "weight": 0.15,
        "before": 0,
        "after": 0,
        "beforeText": "1 shadow level · 81% of surfaces",
        "afterText": "1 shadow level · 81% of surfaces",
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
    "tellScore": 0.8,
    "scoredAgainst": "baseline"
  }
} as TellReport;
