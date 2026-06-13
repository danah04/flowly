import sys, time
from playwright.sync_api import sync_playwright

EXEC = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"
URL = "http://localhost:4178/"
OUT = "/tmp/shots"
import os; os.makedirs(OUT, exist_ok=True)

def shot(page, name):
    page.wait_for_timeout(450)
    page.screenshot(path=f"{OUT}/{name}.png")
    print("shot", name)

with sync_playwright() as p:
    b = p.chromium.launch(executable_path=EXEC)
    page = b.new_page(viewport={"width": 460, "height": 920}, device_scale_factor=2)
    page.goto(URL, wait_until="networkidle")
    shot(page, "01_splash")

    page.get_by_text("Get started").click(); shot(page, "02_signup")
    page.get_by_text("Create account").click(); shot(page, "03_onboarding")
    page.get_by_text("Continue", exact=False).click(); shot(page, "04_today")

    # tab bar nav
    page.get_by_role("button", name="Plan").click(); shot(page, "05_plan")
    page.get_by_role("button", name="Focus").click(); shot(page, "06_focus")
    page.get_by_role("button", name="Coach").click(); shot(page, "07_coach")
    page.get_by_role("button", name="Stats").click(); shot(page, "08_insights")

    # back to today, open profile from avatar
    page.get_by_role("button", name="Today").click(); page.wait_for_timeout(300)
    page.get_by_role("button", name="Open profile").click(); shot(page, "09_profile")

    b.close()
print("DONE")
