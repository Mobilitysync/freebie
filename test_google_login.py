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

    page.goto('http://localhost:3000/login-freelancer.html')
    time.sleep(1)

    # We evaluate JS to check if type="button" is missing and causes a form submit or something else
    print("Is googleBtn a submit button by default?")
    print(page.evaluate('document.getElementById("googleBtn").type'))

    # Evaluate e.preventDefault behavior on click
    page.evaluate('''
        document.getElementById("googleBtn").addEventListener("click", e => {
            console.log("Clicked! Default prevented?", e.defaultPrevented);
        });
    ''')
    page.click('#googleBtn', timeout=3000)
    time.sleep(1)
    print("URL after click:", page.url)

    browser.close()
