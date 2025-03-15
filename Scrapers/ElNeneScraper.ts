//scraper.ts
import { Page } from "https://deno.land/x/puppeteer@16.2.0/mod.ts";
import { SupermarketScraper } from "./SupermarketScraperInterface.ts";
import { ProductInfo } from "../models/product.ts";
import { delay } from "../Utils/Utils.ts";
//import { ScraperError, UnknownError } from "../Utils/errorHandler.ts";

export class ElNeneScraper implements SupermarketScraper {
    async scrapeProduct(search: string, page: Page): Promise<ProductInfo[]> {
        console.log(`Start scraping El Nene`)
        
        const results: ProductInfo[] = [];

        try {
            await this.performSearchURL(page, search);
            await page.addStyleTag({ content: '.elnenearg-store-selector-1-x-popupModal { display: none !important; }' }); //No carga el banner
            results.push(...await this.extractProducts(page));
        } catch (_) {
            results.slice(0, results.length);
        } finally {
            await page.close();
        }
        console.log(`End scraping El Nene`)
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
                unit: undefined,
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