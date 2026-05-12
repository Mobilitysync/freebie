import time
from playwright.sync_api import sync_playwright

def handle_console(msg):
    print(f"Browser console: {msg.type} - {msg.text}")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.on("console", handle_console)

    page.route("**/api/config", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='{"apiKey": "mock", "authDomain": "mock", "projectId": "mock"}'
    ))

    # Mock the identity toolkit request since we have an invalid mock API key
    page.route("**/*identitytoolkit*", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='{}'
    ))

    print("Testing index.html...")
    page.goto('http://localhost:3000/index.html')
    time.sleep(1)

    page.evaluate('''
        const originalRedirect = window.signInWithRedirect;
        window.redirectCalled = false;
        // mock to avoid navigating away
        // Note: we can't easily mock imported modules in browser so we check console logs
    ''')

    page.click('#googleSigninBtn', timeout=3000)
    time.sleep(1)

    print("Testing login-freelancer.html...")
    page.goto('http://localhost:3000/login-freelancer.html')
    time.sleep(1)

    page.click('#googleBtn', timeout=3000)
    time.sleep(1)

    print("Testing login-client.html...")
    page.goto('http://localhost:3000/login-client.html')
    time.sleep(1)

    page.click('#googleBtn', timeout=3000)
    time.sleep(1)

    browser.close()
