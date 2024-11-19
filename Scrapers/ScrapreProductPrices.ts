import { ProductInfo } from "./SupermarketScraperInterface.ts";
import { ScraperFactory } from "./ScraperFactory.ts";

export async function scrapeProductPrices(product: string, supermarkets: string[]): Promise<ProductInfo[]> {
    const scrapingTasks: Promise<ProductInfo[]>[] = [];

    for (const supermarket of supermarkets) {
        const scraper = ScraperFactory.getScraper(supermarket);
        if (scraper) {
            console.log(`Start scraping ${supermarket}`)
            scrapingTasks.push(scraper.scrapeProduct(product));
            console.log(`End scraping ${supermarket}`)
        }
    }

    // Esperamos todas las promesas en paralelo
    const results = (await Promise.all(scrapingTasks)).flat();
    console.log(`Fin del scraping`)
    //return results.sort((a, b) => a.price - b.price);
    return results;
}
