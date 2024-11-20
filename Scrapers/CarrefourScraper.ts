//scraper.ts
import puppeteer, { Page } from "https://deno.land/x/puppeteer@16.2.0/mod.ts";
import { ProductInfo, SupermarketScraper } from "./SupermarketScraperInterface.ts";
import { delay, scrollToBottom } from "../Utils/Utils.ts";
import { ScraperError, UnknownError } from "../Utils/errorHandler.ts";


export class CarrefourScraper implements SupermarketScraper {
    public name = "Carrefour";
    public url = "https://www.carrefour.com.ar";
    async scrapeProduct(search: string): Promise<ProductInfo[]> {
        const browser = await puppeteer.launch({
            executablePath: 'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe',
            //headless: false //Abre el navegador
        });
        const page = await browser.newPage();
        const results: ProductInfo[] = [];

        await page.setViewport({
            width: 1050, // Ancho deseado en píxeles
            height: 600  // Alto deseado en píxeles
        });

        try {
            this.performSearchURL(page, search)
            results.push(...await this.extractProducts(page));
        } catch (error) {
            if (error instanceof Error) {
                throw new ScraperError(error.message);
            } else {
                throw new UnknownError("Ocurrió un error desconocido.");
            }
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
        this.url = `https://www.carrefour.com.ar/${encodeURI(search)}?_q=${search}&map=ft`;
        await page.goto(this.url, { waitUntil: 'domcontentloaded', });
    }

    private async extractProducts(page: Page): Promise<ProductInfo[]> {
        await page.waitForSelector('.valtech-carrefourar-search-result-2-x-paginationButtonPages');
        const cantidad = +(await page.evaluate(() => document.querySelector('.valtech-carrefourar-search-result-2-x-paginationButtonPages.undefined')?.textContent) ?? 1);
        console.log('Buscando productos...' + cantidad);
        const results: ProductInfo[] = [];
        for(let i=1; i<=cantidad; i++){
            results.push(...await this.extractProductPage(page, i));
            console.log(`Pagina ${i}: ${results.length} productos encontrados`);
        }
        return results;
    }

    private async extractProductPage(page: Page, num: number): Promise<ProductInfo[]> {
        await page.goto(this.url + `&page=${num}`, { waitUntil: 'domcontentloaded', });
        await page.waitForSelector('.valtech-carrefourar-search-result-2-x-paginationButtonPages');
        await scrollToBottom(page);
        await delay(2500);
        await scrollToBottom(page);
        await delay(2500);
        const salida = await page.evaluate(() => {
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
        return (salida.some(product => !product.title || !product.price || !product.link)) ? this.extractProductPage(page, num) : salida;
    }
}