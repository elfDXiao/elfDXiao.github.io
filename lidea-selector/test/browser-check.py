# -*- coding: utf-8 -*-
"""Lidea 选型 UI · 真实浏览器门禁（可选，需本机 python playwright + chromium）

用法：
    python -m http.server 8093            # 在 lidea-selector/ 目录起服务
    python test/browser-check.py          # 另开终端
覆盖：页面无 JS 错误、16 步、按 2026-10-19 官方核对修订值渲染（P.114/P.117/P.129/P.132 等），出截图。
"""
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

import os
# 默认本地：在仓库根目录起 `python -m http.server 8093`；也可 LIDEA_BASE=https://elfdxiao.github.io/lidea-selector/ python test/browser-check.py 直测线上
BASE = os.environ.get("LIDEA_BASE", "http://127.0.0.1:8093/lidea-selector/")
OUT = Path(__file__).resolve().parent / "_browser-shots"
OUT.mkdir(exist_ok=True)

results = []


def check(name, cond, detail=""):
    results.append((name, bool(cond)))
    print(("[PASS] " if cond else "[FAIL] ") + name + (f" — {detail}" if detail else ""))


def js_click(page, selector):
    """用页面内 DOM click 代替鼠标点击（班务页有浮层可能拦截指针）"""
    ok = page.evaluate("""(sel) => { const el = document.querySelector(sel); if (!el) return false; el.click(); return true; }""", selector)
    page.wait_for_timeout(150)
    return ok


def card(page, dim, code):
    """dim 步骤里的 opt-card 定位（label 含 input[data-code]）"""
    return page.locator(f'.opt-block[data-dim="{dim}"] label.opt-card:has(input[data-code="{code}"])').first


def price_of(page, dim, code):
    """取卡片价格文本；双语模式下 '基本 / 基本仕様' 取前段"""
    el = card(page, dim, code)
    txt = el.locator(".opt-price").inner_text().strip()
    return txt.split(" / ")[0]


def disabled_of(page, dim, code):
    el = card(page, dim, code)
    return "disabled" in (el.get_attribute("class") or "")


def goto_step(page, n):
    js_click(page, f'#wizStepper .wstep[data-step="{n}"]')


def main():
    errors = []
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="msedge", headless=True)   # 本机用系统 Edge（与 bath-doc 门禁同口径）
        page = browser.new_page(viewport={"width": 1440, "height": 1000})
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
        page.goto(BASE, wait_until="load")
        page.wait_for_selector("#wizStepper .wstep", timeout=15000)
        # 站内密码门（index.html 内置）
        if page.locator("#pwGate.show").count():
            page.fill("#pwInput", "elff")
            js_click(page, "#pwBtn")
            page.wait_for_timeout(400)
        if page.locator("#hobbyNotice.show").count():
            js_click(page, "#hobbyNotice [data-close]")
            page.wait_for_timeout(300)

        check("页面无 JS 错误（加载时）", not errors, "; ".join(errors[:2]))
        check("向导 16 步", page.locator("#wizStepper .wstep").count() == 16,
              page.locator("#wizStepper .wstep").count())

        # 尺寸 1624 + C タイプ
        js_click(page, '.size-card[data-size="1624"]')
        js_click(page, '.opt-block[data-dim="type"] input[data-code="C"]')

        # P.114 床
        goto_step(page, 3)
        check("P.114 C×1E 显示 ＋￥50,000", price_of(page, "floor", "1E") == "＋￥50,000", price_of(page, "floor", "1E"))
        check("P.114 C×1F 显示 ＋￥70,000", price_of(page, "floor", "1F") == "＋￥70,000", price_of(page, "floor", "1F"))
        check("P.114 C×2E 可选（C専用・基本仕様）", not disabled_of(page, "floor", "2E"), price_of(page, "floor", "2E"))

        # P.117 排水栓（材質で可/不可が変わる）
        goto_step(page, 4)
        js_click(page, '.opt-block[data-dim="bt_tub"] input[data-code="T6"]')
        check("P.117 パール×ゴム栓 禁用", disabled_of(page, "bt_drain", "DRAIN1"))
        js_click(page, '.opt-block[data-dim="bt_tub"] input[data-code="TA"]')
        check("P.117 C×ゴム栓（FRP）＝基本仕様（±0）", price_of(page, "bt_drain", "DRAIN1") == "基本",
              price_of(page, "bt_drain", "DRAIN1"))
        check("P.117 C×プッシュ（FRP）＝＋￥15,000", price_of(page, "bt_drain", "DRAIN3") == "＋￥15,000",
              price_of(page, "bt_drain", "DRAIN3"))

        # 切回 M タイプ（NY/KD 等 HBM 列的检查）
        goto_step(page, 0)
        js_click(page, '.opt-block[data-dim="type"] input[data-code="M"]')

        # P.128 カウンター
        goto_step(page, 11)
        check("P.128 カウンターNY 显示 －￥35,000", price_of(page, "counter", "NY") == "－￥35,000",
              price_of(page, "counter", "NY"))

        # P.129 照明
        goto_step(page, 12)
        check("P.129 EC（標準）＝基本仕様", price_of(page, "lighting", "EC") in ("基本", "基本仕様"), price_of(page, "lighting", "EC"))
        check("P.129 EC_UP＝＋￥17,900", price_of(page, "lighting", "EC_UP") == "＋￥17,900", price_of(page, "lighting", "EC_UP"))
        check("P.129 YC＠1624＝＋￥3,900", price_of(page, "lighting", "YC") == "＋￥3,900", price_of(page, "lighting", "YC"))

        # P.130 ミラー
        check("P.130 ミラーNN（M）＝－￥13,500", price_of(page, "mirror", "NN") == "－￥13,500",
              price_of(page, "mirror", "NN"))

        # P.132 収納（KD=HD 同額）
        goto_step(page, 13)
        check("P.132 KD（M）＝－￥5,200", price_of(page, "storage", "KD") == "－￥5,200", price_of(page, "storage", "KD"))
        check("P.132 GT（M）＝＋￥31,700（FT 同額）", price_of(page, "storage", "GT") == "＋￥31,700", price_of(page, "storage", "GT"))
        check("P.132 JT/KT 卡片存在（HT 同額）", card(page, "storage", "JT").count() > 0 and card(page, "storage", "KT").count() > 0)

        # P.144 給水配管：新規 エ・ニ が出る
        goto_step(page, 15)
        check("P.144 配管エ 卡片存在", card(page, "water_pipe", "E").count() > 0)
        check("P.144 配管ニ 卡片存在", card(page, "water_pipe", "NI").count() > 0)

        # 报价单总额自洽：合计 = 基本价 + 各行 diff
        api = page.evaluate("""() => {
          const Q = window.LIDEA.quote; const q = Q.computeQuote();
          const sum = q.basePrice + q.lines.filter(l => !l.base).reduce((n, l) => n + l.diff, 0);
          return { base: q.basePrice, totalEx: q.totalEx, sum: sum, unknown: q.unknown.length };
        }""")
        check("报价单：base＋明细 = 税抜合計", api["base"] + (api["totalEx"] - api["base"]) == api["totalEx"] and api["sum"] == api["totalEx"], str(api))
        check("加载后仍无 JS 错误", not errors, "; ".join(errors[:2]))

        page.screenshot(path=str(OUT / "full.png"), full_page=False)
        goto_step(page, 12)
        page.screenshot(path=str(OUT / "lighting.png"), full_page=False)
        browser.close()

    ok = all(c for _, c in results)
    print(f"\n{'✅ 全部通过' if ok else '❌ 有失败'}（{sum(1 for _, c in results if c)}/{len(results)}）")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())