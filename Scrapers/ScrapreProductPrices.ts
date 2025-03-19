import { ProductInfo } from "../models/product.ts";
import { ScraperFactory } from "./ScraperFactory.ts";

export async function scrapeProductPrices(product: string, supermarkets: string[]): Promise<ProductInfo[]> {
    const scrapingTasks: Promise<ProductInfo[]>[] = [];

    if (supermarkets.length === 0) {
        supermarkets.push('coto', 'carrefour', 'elnene');
    }
    for (const supermarket of supermarkets) {
        const scraper = ScraperFactory.getScraper(supermarket);
        if (scraper) {
            scrapingTasks.push(scraper.scrapeProduct(product));
        }
    }

    // Esperamos todas las promesas en paralelo
    const results = (await Promise.all(scrapingTasks)).flat();
    console.log(`Fin del scraping`)
    //return results.sort((a, b) => a.price - b.price);
    return results;
}
