import time
import sys
from playwright.sync_api import sync_playwright

def handle_console(msg):
    print(f"Browser console: {msg.type} - {msg.text}")

def handle_error(err):
    print(f"Browser error: {err}")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.on("console", handle_console)
    page.on("pageerror", handle_error)

    page.route("**/api/config", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='{"apiKey": "mock", "authDomain": "mock", "projectId": "mock"}'
    ))

    # Test 1: Google button in index.html
    page.goto('http://localhost:3000/')
    time.sleep(1)
    print("Testing Google button in index.html")
    page.click('#googleSigninBtn', timeout=3000)
    time.sleep(1)
    if "localhost:3000" in page.url and "?" not in page.url:
        print("Success: Page did not reload unexpectedly on index.html googleSigninBtn")
    else:
        print(f"Failed: URL is {page.url}")

    # Test 2: Google button in login-freelancer.html
    page.goto('http://localhost:3000/login-freelancer.html')
    time.sleep(1)
    print("Testing Google button in login-freelancer.html")
    page.click('#googleBtn', timeout=3000)
    time.sleep(1)
    if "login-freelancer.html" in page.url and "?" not in page.url:
        print("Success: Page did not reload unexpectedly on login-freelancer.html googleBtn")
    else:
        print(f"Failed: URL is {page.url}")

    # Test 3: forgot-password.html
    page.goto('http://localhost:3000/forgot-password.html')
    time.sleep(1)
    print("Testing forgot-password.html")
    page.fill('#email', 'test@example.com')
    page.click('#resetBtn')
    time.sleep(1)
    # Just check if error div is visible and has text. Since we mocked API, it will throw an auth error
    error_text = page.inner_text('#authError')
    if error_text:
        print(f"Success: Auth error shown for fake request: {error_text}")
    else:
        print("Failed: No message shown for password reset")

    browser.close()
