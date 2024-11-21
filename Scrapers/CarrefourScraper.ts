//scraper.ts
import { Page } from "https://deno.land/x/puppeteer@16.2.0/mod.ts";
import { SupermarketScraper } from "./SupermarketScraperInterface.ts";
import { ProductInfo } from "../models/product.ts";
import { delay, scrollToBottom } from "../Utils/Utils.ts";
//import { ScraperError, UnknownError } from "../Utils/errorHandler.ts";


export class CarrefourScraper implements SupermarketScraper {
    async scrapeProduct(search: string, page: Page): Promise<ProductInfo[]> {
        console.log(`Start scraping Carrefour`)
        const results: ProductInfo[] = [];

        await page.setViewport({
            width: 1050, // Ancho deseado en píxeles
            height: 600  // Alto deseado en píxeles
        });

        try {
            await this.performSearchURL(page, search)
            results.push(...await this.extractProducts(page));
        } catch (_) {
            results.slice(0, results.length);
        } finally {
            await page.close();
        }
        console.log(`End scraping Carrefour`)
        return results;
    }

    private async performSearch(page: Page, search: string) {
        await page.waitForSelector('#downshift-0-input');
        await page.type('#downshift-0-input', search, { delay: 100 });
        await delay(200);
        await page.keyboard.press('Enter');
    }

    private async performSearchURL(page: Page, search: string) {
        await page.goto(`https://www.carrefour.com.ar/${encodeURI(search)}?_q=${search}&map=ft`, { waitUntil: 'domcontentloaded', });
    }

    private async extractProducts(page: Page): Promise<ProductInfo[]> {
        await page.waitForSelector('.vtex-flex-layout-0-x-flexRow--galleyProducts a article img');
        await scrollToBottom(page);
        await delay(2500);
        await scrollToBottom(page);
        await delay(2500);
        return await page.evaluate(() => {
            return Array.from(document.querySelectorAll('a article')).map((product) => ({
                supermarket: 'Carrefour',
                search: globalThis.location.href,
                title: product.querySelector(".t-body")?.textContent || "No encontrado",
                unit: [product.querySelector('.valtech-carrefourar-dynamic-weight-price-0-x-unit')?.textContent, +(Array.from(product.querySelectorAll('.valtech-carrefourar-dynamic-weight-price-0-x-currencyContainer span')).map(span => span.textContent?.trim()).join('')).replace('$', '').replace('.', '').replace(',', '.')] as [string, number],
                price: +(Array.from(product.querySelectorAll('.valtech-carrefourar-product-price-0-x-sellingPriceValue span span')).map(digit => digit.textContent?.trim()).join('')).replace('$', '').replace('.', '').replace(',', '.'),
                image: product.querySelector("img")?.getAttribute('src') || "Imagen no encontrada",
                link: "https://www.carrefour.com.ar" + product.parentElement?.parentElement?.querySelector("a")?.getAttribute('href') || "Link no encontrado"
            }));
        });
    }
}