import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  
  await page.goto('http://localhost:5174/');
  await new Promise(r => setTimeout(r, 1000));
  
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const loginBtn = btns.find(b => b.textContent.includes('Sign In'));
    if (loginBtn) loginBtn.click();
  });
  
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('Final URL:', page.url());
  const html = await page.content();
  console.log('Includes CQIS?', html.includes('CQIS'));
  
  await browser.close();
})();
