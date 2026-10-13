"""End-to-end checks for the V7 target planning and target-results views."""

import os
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1] / "v7"


class QuietHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, *_args):
        pass


def run(base):
    chrome = os.environ.get("CHROME_BIN")
    if not chrome and Path("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome").exists():
        chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True, executable_path=chrome)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.goto(f"{base}/views.html#goals", wait_until="networkidle")

        # The draft starts with a real remainder; changing a child must update it.
        assert "待分解 4 万" in page.locator("#goalValidation").inner_text()
        page.locator('[data-goal-scope="teamA"]').first.click()
        assert "品线 A 团队 · 目标分解" in page.locator(".goal-work-head").inner_text()
        assert "待分解 2 万" in page.locator("#goalValidation").inner_text()
        page.locator('#goalMetricGroup').select_option('results')
        assert "采购成本" in page.locator(".goal-compile-table").inner_text()
        page.locator('#goalMetricGroup').select_option('core')
        page.locator('[data-goal-edit="storeB:profit"]').fill("21")
        assert "下级超出 1 万" in page.locator("#goalValidation").inner_text()
        page.locator("#goalSave").click()
        assert "草案已保存在当前浏览器" in page.locator("#goalToast").inner_text()

        # Saved draft survives reload, while the confirmed report stays at V1.
        page.reload(wait_until="networkidle")
        page.locator('[data-goal-scope="teamA"]').first.click()
        assert page.locator('[data-goal-edit="storeB:profit"]').input_value() == "21"
        page.locator('[data-goal-mode="report"]').click()
        assert "已确认 V1" in page.locator(".goal-context").inner_text()
        assert "月底预计少 20 万" in page.locator(".goal-result-hero").inner_text()
        assert page.locator('[data-goal-metric]').count() == 8
        page.locator('[data-goal-metric="ads"]').click()
        assert "月度预算 30" in page.locator(".goal-result-hero").inner_text()
        assert "月末预计超 2 万" in page.locator(".goal-result-hero").inner_text()
        page.locator('[data-goal-metric="profit"]').click()
        page.locator('.goal-break-row[data-goal-scope="storeB"]').click()
        assert "店铺 B · 品线 A" in page.locator("#goalScopeName").inner_text()
        assert "多 6 万" in page.locator(".goal-result-hero").inner_text()
        page.locator('.goal-analysis-link').click()
        assert page.locator('#routeCrumb').inner_text() == "利润分析"

        # Menu, alternate tree, search, and all eight metric selections respond.
        page.goto(f"{base}/views.html#goals", wait_until="networkidle")
        page.locator('#goalTreeMode').select_option('stores')
        assert page.locator('.goal-tree-list [data-goal-scope="storeE"]').count() == 1
        page.locator('#goalTreeSearch').fill('店铺 D')
        assert page.locator('.goal-tree-list [data-goal-scope]').count() == 2
        page.locator('.goal-tree-list [data-goal-scope="storeD"]').click()
        assert "店铺 D · 品线 B" in page.locator('#goalScopeName').inner_text()
        page.locator('[data-goal-mode="report"]').click()
        for metric in ('profit', 'revenue', 'gross', 'cash', 'procurement', 'ads', 'tail', 'stock'):
            page.locator(f'[data-goal-metric="{metric}"]').click()
            assert page.locator(f'[data-goal-metric="{metric}"]').get_attribute('aria-pressed') == 'true'
            assert page.locator('.goal-result-hero').is_visible()

        # Mobile: no page-wide horizontal overflow; the tables scroll locally.
        mobile = browser.new_page(viewport={"width": 390, "height": 844})
        mobile.goto(f"{base}/views.html#goals", wait_until="networkidle")
        assert not mobile.evaluate("document.documentElement.scrollWidth > innerWidth")
        mobile.locator('[data-goal-mode="report"]').click()
        assert not mobile.evaluate("document.documentElement.scrollWidth > innerWidth")
        assert not errors, errors
        browser.close()
    print("V7 target planning and results interactions passed.")


if __name__ == "__main__":
    server = ThreadingHTTPServer(("127.0.0.1", 0), QuietHandler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        run(f"http://127.0.0.1:{server.server_port}")
    finally:
        server.shutdown()
