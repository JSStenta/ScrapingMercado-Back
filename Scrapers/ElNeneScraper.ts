//scraper.ts
import puppeteer, { Page } from "https://deno.land/x/puppeteer@16.2.0/mod.ts";
import { ProductInfo, SupermarketScraper } from "./SupermarketScraperInterface.ts";
import { delay } from "../Utils/Utils.ts";
import { ScraperError, UnknownError } from "../Utils/errorHandler.ts";

export class ElNeneScraper implements SupermarketScraper {
    async scrapeProduct(search: string): Promise<ProductInfo[]> {
        const browser = await puppeteer.launch({
            executablePath: 'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe',
            //headless: false //Abre el navegador
        });
        const page = await browser.newPage();
        const results: ProductInfo[] = [];

        try {
            await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");
            await this.performSearchURL(page, search);
            await page.addStyleTag({ content: '.elnenearg-store-selector-1-x-popupModal { display: none !important; }' }); //No carga el banner
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

    private async performSearchURL(page: Page, search: string) {
        await page.goto(`https://www.grupoelnene.com.ar/${encodeURI(search)}?_q${search.replaceAll(' ', '+')}&map=ft&order=OrderByPriceASC`, { waitUntil: 'load' });
    }

    private async extractProducts(page: Page): Promise<ProductInfo[]> {
        await page.waitForSelector('.vtex-product-summary-2-x-container--plp-shelf');
        return await page.evaluate(() => {
            return Array.from(document.querySelectorAll('.vtex-product-summary-2-x-container--plp-shelf')).map((product) => ({
                supermarket: 'El Nene',
                search: globalThis.location.href,
                title: product.querySelector(".t-body")?.textContent || "No encontrado",
                unit: ['-', Infinity] as [string, number],
                price: +(Array.from(product.querySelectorAll('.vtex-product-price-1-x-sellingPriceValue .vtex-product-price-1-x-currencyContainer span')).map(span => span.textContent?.trim()).join('')).replace('$', '').replace('.', '').replace(',', '.'),
                image: product.querySelector("img")?.getAttribute('src') || "Imagen no encontrada",
                link: "https://www.grupoelnene.com.ar" + product.querySelector("a")?.getAttribute('href') || "Link no encontrado"
            }));
        });
    }

    private async navegacion(page: Page) {
        console.log('paseando por el nene')
        await page.waitForSelector('.elnenearg-store-selector-1-x-iconContainerBtnSelector--zipSelector');
        await page.evaluate(() => {
            (document.querySelector('.elnenearg-store-selector-1-x-iconContainerBtnSelector--zipSelector') as HTMLElement).click();
            (document.querySelector('.elnenearg-store-selector-1-x-inputStyles') as HTMLElement).click();
        })
        await page.waitForSelector('.elnenearg-store-selector-1-x-inputStyles');
        await page.type('.elnenearg-store-selector-1-x-inputStyles', '1900', { delay: 200 });
        await page.evaluate(() => {
            (document.querySelector('.elnenearg-store-selector-1-x-buttonForm') as HTMLElement).click();
        })
        await delay(5000);
        console.log('dejando de pasear')
    }
}