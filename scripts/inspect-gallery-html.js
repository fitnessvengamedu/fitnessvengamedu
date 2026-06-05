const { chromium } = require('playwright');

async function inspectGallery() {
  console.log("Launching browser...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Capture console messages
  page.on('console', msg => {
    console.log(`[Browser Console] ${msg.type().toUpperCase()}: ${msg.text()}`);
  });

  // Capture failed network requests
  page.on('requestfailed', request => {
    console.log(`[Request Failed] URL: ${request.url()} | Error: ${request.failure().errorText}`);
  });

  page.on('response', response => {
    if (response.status() >= 400) {
      console.log(`[HTTP Error] URL: ${response.url()} | Status: ${response.status()}`);
    }
  });

  try {
    console.log("Navigating to http://localhost:3000/gallery...");
    await page.goto('http://localhost:3000/gallery', { waitUntil: 'networkidle' });
    
    // Wait for items to load
    await page.waitForTimeout(3000);
    
    console.log("\nEvaluating DOM elements in Gallery...");
    const imgData = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs.map(img => ({
        src: img.src,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        className: img.className,
        outerHTML: img.outerHTML,
        computedStyle: window.getComputedStyle(img).display
      }));
    });
    
    console.log("Found images:", JSON.stringify(imgData, null, 2));

  } catch (err) {
    console.error("Error inspecting page:", err);
  } finally {
    await browser.close();
  }
}

inspectGallery();
