//scraper.ts
import puppeteer, { Page } from "https://deno.land/x/puppeteer@16.2.0/mod.ts";
import { ProductInfo, SupermarketScraper } from "./SupermarketScraperInterface.ts";
import { delay, scrollToBottom } from "./Utils.ts";

export class CarrefourScraper implements SupermarketScraper {
    async scrapeProduct(search: string): Promise<ProductInfo[]> {
        const browser = await puppeteer.launch({
            executablePath: 'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe',
            headless: true,
        });
        const page = await browser.newPage();
        const results: ProductInfo[] = [];

        await page.setViewport({
            width: 1050, // Ancho deseado en píxeles
            height: 600  // Alto deseado en píxeles
        });

        try {
            /*
            await page.goto("https://www.carrefour.com.ar/", { waitUntil: 'domcontentloaded' });
            await Promise.all([
                page.waitForNavigation(),
                ])

            await page.setRequestInterception(true);
            page.on('request', (request) => {
                if (request.resourceType() === 'image') {
                    request.abort(); // Bloquea la solicitud si es CSS
                } else {
                    request.continue(); // Permite todas las demás solicitudes
                }
            });*/

            this.performSearchURL(page, search)
            results.push(...await this.extractProducts(page));
        } catch (error) {
            console.error("Error scraping Carrefour:", error);
            return []
        } finally {
            await page.close();
            await browser.close();
        }

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
        await delay(2000);
        await scrollToBottom(page);
        await delay(2000);
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