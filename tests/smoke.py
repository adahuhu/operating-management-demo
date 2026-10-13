"""Browser smoke checks for chart motion and the demo's visible controls."""

import os
import re
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from playwright.sync_api import sync_playwright


ROOT = Path(os.environ.get("DEMO_ROOT") or Path(__file__).resolve().parents[1]).resolve()


class QuietHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, *_args):
        pass


def visit(page, base, route):
    page.goto(f"{base}/views.html?v=smoke#{route}", wait_until="networkidle")
    assert page.locator("#routeCrumb").inner_text()


def run(base):
    is_v7 = (ROOT / "goals-v7.js").exists()
    versions=set(re.findall(r"\?v=(\d{8}[a-z])", "\n".join((ROOT / name).read_text() for name in ("index.html", "views.html", "views.js"))))
    assert len(versions)==1, f"Mixed asset/cache versions: {sorted(versions)}"
    chrome = os.environ.get("CHROME_BIN")
    if not chrome and Path("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome").exists():
        chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True, executable_path=chrome)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))

        page.goto(f"{base}/index.html?v=smoke", wait_until="networkidle")
        assert page.locator("#filterCountry option").count() == 6
        page.locator("#filterCountry").select_option("德国")
        assert "店铺 D" in page.locator("#filteredOverview .scope-table tbody").inner_text()
        page.locator("#filterReset").click()
        assert page.locator("#filteredOverview").is_hidden()
        page.locator('[data-period-toggle="month"]').click()
        assert page.locator('[data-period-panel="month"]').is_visible()
        page.locator('[data-period-toggle="day"]').click()
        assert page.locator('[data-period-panel="day"]').is_visible()
        page.locator('[data-expense-scope="platform"]').click()
        assert page.locator("#expenseRows tr").count() == 4
        for filter_id, value in (("filterStore", "店铺 D"), ("filterLine", "品线 B"), ("filterPlatform", "Walmart")):
            page.locator(f"#{filter_id}").select_option(value)
            assert page.locator("#filteredOverview").is_visible()
            page.locator("#filterReset").click()
        page.locator('#profitStart').fill('2026-10-12')
        page.locator('#profitEnd').fill('2026-10-18')
        page.locator('#profitRangeApply').click()
        assert '7 天' in page.locator('#profitRangeMessage').inner_text()
        page.locator('.side a[href*="#profit"]').click()
        page.wait_for_function("document.querySelector('#routeCrumb').textContent === '利润分析'")
        page.locator('#viewNav a[data-route="goals"]').click()
        page.wait_for_function("document.querySelector('#routeCrumb').textContent === '目标制定'")

        visit(page, base, "goals")
        if is_v7:
            assert page.locator('.goal-compile-table tbody tr').count() == 5
            page.locator('[data-goal-mode="report"]').click()
            assert page.locator('[data-goal-metric]').count() == 8
            assert '月底预计少 20 万' in page.locator('.goal-result-hero').inner_text()
        else:
            assert page.locator("#viewMain .view-kpi").count() == 4
            assert page.locator('#viewMain .view-archive a[href="#goals"]').count() == 0
            if page.locator('.v6-formula').count():
                assert page.locator('.v6-formula-item').count() == 5
                assert '770' in page.locator('.v6-formula').inner_text()

        visit(page, base, "profit")
        if page.locator('.v6-formula').count():
            assert '采购成本多' in page.locator('.v6-formula').inner_text()
            assert '160' in page.locator('.v6-formula').inner_text()
        page.locator('[data-profit-period="month"]').click()
        assert page.locator('[data-profit-view="month"]').is_visible()
        page.locator('[data-profit-period="day"]').click()
        page.locator("#viewProfitStart").fill("2026-10-12")
        page.locator("#viewProfitEnd").fill("2026-10-18")
        page.locator("#viewProfitApply").click()
        assert "共 7 天" in page.locator("#viewProfitMessage").inner_text()
        page.locator("#viewProfitStart").fill("2026-09-01")
        page.locator("#viewProfitApply").click()
        assert "最多 30 天" in page.locator("#viewProfitMessage").inner_text()

        visit(page, base, "revenue")
        if page.locator('.v6-order-day').count():
            assert page.locator('.v6-order-day').count() == 7
            assert '525 单' in page.locator('.v6-order-day').last.inner_text()
        country = page.locator('.v5-country-row[data-country-select="德国"]')
        country.click()
        section = page.locator(".view-section").filter(has_text="店铺和国家").first
        assert section.locator("table tbody tr:visible").count() == 1
        assert "店铺 D" in section.locator("table tbody tr:visible").inner_text()
        section.locator("#countryReset").click()
        assert section.locator("table tbody tr:visible").count() == 5
        assert section.locator(".v5-revenue-map-dot").count() == 5
        section.locator('.v5-revenue-map-country[data-country-select="英国"]').focus()
        page.keyboard.press('Enter')
        assert section.locator('table tbody tr:visible').count() == 1
        assert '店铺 B' in section.locator('table tbody tr:visible').inner_text()

        visit(page, base, "goods")
        if page.locator('.v6-compare-row').count():
            assert page.locator('.v6-compare-row').count() == 3
            assert '58.8%' in page.locator('.v6-compare-row').first.inner_text()
        page.locator('[data-goods-filter="aged"]').click()
        assert page.locator("[data-good-row]:visible").count() == 2
        for tag in ('loss', 'shortage', 'new', 'all'):
            page.locator(f'[data-goods-filter="{tag}"]').click()
            assert page.locator(f'[data-goods-filter="{tag}"]').get_attribute('aria-selected') == 'true'
        page.locator('[data-goods-filter="aged"]').click()
        page.locator("#goodsLine").select_option("品线 B")
        assert page.locator("[data-good-row]:visible").count() == 1
        page.locator('[data-good-select="D021"]').first.click()
        assert "商品 D-021" in page.locator("#goodsDetail").inner_text()

        visit(page, base, "cost")
        if page.locator('.v6-variance').count():
            assert page.locator('.v6-variance > div').count() == 3
            assert '多 30 万' in page.locator('.v6-variance').inner_text()
        for scope in ('line', 'platform'):
            page.locator(f'[data-spend-view="{scope}"]').click()
            assert page.locator(f'[data-spend-view="{scope}"]').get_attribute('aria-selected') == 'true'
        assert page.locator("#spendTable tbody tr").count() == 3

        visit(page, base, "channel")
        if page.locator('.v6-compare-row').count():
            assert page.locator('.v6-compare-row').count() == 3
            assert '59.4%' in page.locator('.v6-compare-row').first.inner_text()
        for platform in ('Amazon', 'TikTok Shop', 'Walmart'):
            page.locator(f'[data-channel-platform="{platform}"]').click()
            assert page.locator(f'[data-channel-platform="{platform}"]').get_attribute('aria-selected') == 'true'
        assert page.locator("#channelRows tbody tr").count() == 1

        visit(page, base, "todos")
        if page.locator('.v6-decision-gate').count():
            assert page.locator('.v6-decision-gate').count() == 2
        page.locator('[data-action-filter="bad"]').click()
        assert page.locator("[data-action-kind]:visible").count() == 1
        for kind in ('open', 'check'):
            page.locator(f'[data-action-filter="{kind}"]').click()
            assert page.locator(f'[data-action-filter="{kind}"]').get_attribute('aria-selected') == 'true'
        page.locator('[data-action-filter="all"]').click()
        assert page.locator("[data-action-kind]:visible").count() == 6
        assert not errors, errors

        # Count actual Web Animations API calls, including graphics below the fold.
        for route, selector in [
            ("goals", ".goal-break-track > i" if is_v7 else ".v5-track > i"), ("profit", ".view-line-chart .series"),
            ("revenue", ".view-pie"), ("goods", ".goods-profit-bar"),
            ("cost", ".view-pie"), ("channel", ".depth-scatter-dot"),
            ("todos", ".v5-track > i"),
        ]:
            motion_page = browser.new_page(viewport={"width": 1440, "height": 900})
            motion_page.add_init_script("""
                window.__chartAnimationCount = 0;
                window.__animatedParents = [];
                const animate = Element.prototype.animate;
                Element.prototype.animate = function(...args) {
                  window.__chartAnimationCount++;
                  window.__animatedParents.push(this.parentElement?.className || '');
                  return animate.apply(this, args);
                };
            """)
            visit(motion_page, base, route)
            if route == 'goals' and is_v7:
                motion_page.locator('[data-goal-mode="report"]').click()
            motion_page.locator(selector).first.scroll_into_view_if_needed()
            motion_page.wait_for_timeout(150)
            count = motion_page.evaluate("window.__chartAnimationCount")
            assert count > 0, f"{route}: no graphic animation"
            if route == 'revenue' and motion_page.locator('.v6-order-rail').count():
                assert 'v6-order-rail' in motion_page.evaluate("window.__animatedParents"), 'V6 order chart did not animate'
            if route == 'goods' and motion_page.locator('.v6-compare-track').count():
                assert 'v6-compare-track' in motion_page.evaluate("window.__animatedParents"), 'V6 comparison did not animate'
            motion_page.close()

        home_motion = browser.new_page(viewport={"width": 1440, "height": 900})
        home_motion.add_init_script("""
            window.__chartAnimationCount = 0;
            const animate = Element.prototype.animate;
            Element.prototype.animate = function(...args) {
              window.__chartAnimationCount++;
              return animate.apply(this, args);
            };
        """)
        home_motion.goto(f"{base}/index.html?v=smoke", wait_until="networkidle")
        home_motion.locator('.pie').first.scroll_into_view_if_needed()
        home_motion.wait_for_timeout(150)
        assert home_motion.evaluate('window.__chartAnimationCount') > 0
        home_motion.close()

        reduced = browser.new_page(reduced_motion="reduce")
        reduced.add_init_script("""
            window.__chartAnimationCount = 0;
            const animate = Element.prototype.animate;
            Element.prototype.animate = function(...args) {
              window.__chartAnimationCount++;
              return animate.apply(this, args);
            };
        """)
        visit(reduced, base, "revenue")
        reduced.locator(".view-pie").first.scroll_into_view_if_needed()
        assert reduced.evaluate("window.__chartAnimationCount") == 0
        assert reduced.locator(".view-pie").first.is_visible()
        reduced.close()

        mobile = browser.new_page(viewport={"width": 390, "height": 844})
        visit(mobile, base, "revenue")
        mobile.locator('.v5-revenue-map-mobile [data-country-select="加拿大"]').click()
        assert mobile.locator(".v5-revenue-map-details table tbody tr:visible").count() == 1
        assert not mobile.evaluate("document.documentElement.scrollWidth > innerWidth")
        for route in ('goals', 'profit', 'goods', 'cost', 'channel', 'todos'):
            visit(mobile, base, route)
            assert not mobile.evaluate("document.documentElement.scrollWidth > innerWidth"), route
        mobile.close()
        browser.close()
    print("Smoke passed: home, seven views, responsive controls, chart motion, reduced motion.")


if __name__ == "__main__":
    server = ThreadingHTTPServer(("127.0.0.1", 0), QuietHandler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        run(f"http://127.0.0.1:{server.server_port}")
    finally:
        server.shutdown()
