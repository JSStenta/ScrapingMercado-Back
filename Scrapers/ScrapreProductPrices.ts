import { ProductInfo } from "../models/product.ts";
import { ScraperFactory } from "./ScraperFactory.ts";
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

export async function scrapeProductPrices(product: string, supermarkets: string[]): Promise<ProductInfo[]> {
    const scrapingTasks: Promise<ProductInfo[]>[] = [];

    if (supermarkets.length === 0) {
        supermarkets.push('coto', 'carrefour', 'elnene');
    }
    const browser = await puppeteer.launch({
        executablePath: 'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe',
        //headless: false //Abre el navegador
    });
    for (const supermarket of supermarkets) {
        const scraper = ScraperFactory.getScraper(supermarket);
        if (scraper) {
            const page = await browser.newPage();
            await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");
            scrapingTasks.push(scraper.scrapeProduct(product, page));
        }
    }

    // Esperamos todas las promesas en paralelo
    const results = (await Promise.all(scrapingTasks)).flat();
    await browser.close();
    console.log(`Fin del scraping`)
    //return results.sort((a, b) => a.price - b.price);
    return results;
}
