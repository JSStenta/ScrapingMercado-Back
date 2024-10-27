import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

interface ProductInfo {
  supermarket: string;
  product: string;
  price: string;
}

export async function scrapeProductPrices(
  product: string,
  supermarkets: string[]
): Promise<ProductInfo[]> {
  const browser = await puppeteer.launch();
  const results: ProductInfo[] = [];

  for (const supermarket of supermarkets) {
    const page = await browser.newPage();
    const url = `https://www.${supermarket}.com/search?q=${encodeURIComponent(
      product
    )}`;

    try {
      await page.goto(url);
      const price = await page.evaluate(() => {
        const priceElement = document.querySelector(".price-selector"); // Actualiza el selector
        return priceElement ? priceElement.textContent.trim() : "No disponible";
      });
      results.push({ supermarket, product, price });
    } catch (error) {
      console.error(`Error en el scraping de ${supermarket}: ${error}`);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  return results;
}
