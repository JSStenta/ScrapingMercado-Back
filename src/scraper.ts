import puppeteer from "https://deno.land/x/puppeteer/mod.ts";

export const scrapeExample = async (url: string) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: "networkidle2" });

  // Realiza el scraping de información
  const data = await page.evaluate(() => {
    const title = document.querySelector("title")?.textContent || "Sin título";
    return { title };
  });

  await browser.close();
  return data;
};
