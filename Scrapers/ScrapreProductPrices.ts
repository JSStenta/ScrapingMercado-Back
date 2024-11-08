import { ProductInfo } from "./SupermarketScraperInterface.ts";
import { ScraperFactory } from "./ScraperFactory.ts";

export async function scrapeProductPrices(product: string, supermarkets: string[]): Promise<ProductInfo[]> {
    const scrapingTasks: Promise<ProductInfo[]>[] = [];

    for (const supermarket of supermarkets) {
        console.log(`Scraping ${supermarket}`)
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
