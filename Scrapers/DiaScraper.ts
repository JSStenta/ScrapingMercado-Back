//scraper.ts
import puppeteer, { Page } from "https://deno.land/x/puppeteer@16.2.0/mod.ts";
import { SupermarketScraper } from "./SupermarketScraperInterface.ts";
import { ProductInfo } from "../models/product.ts";
import { autoScroll } from "../Utils/Utils.ts";
import { ScraperError, UnknownError } from "../Utils/errorHandler.ts";

export class DiaScraper implements SupermarketScraper {
    async scrapeProduct(search: string): Promise<ProductInfo[]> {
        const browser = await puppeteer.launch({
            executablePath: 'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe',
            //headless: false //Abre el navegador
        });
        const page = await browser.newPage();
        const results: ProductInfo[] = [];

        await page.setViewport({
            width: 1030, // Ancho deseado en píxeles
            height: 600  // Alto deseado en píxeles
        });

        try {
            await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");
            await this.performSearchURL(page, search);
            await autoScroll(page);
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
        await page.goto(`https://diaonline.supermercadosdia.com.ar/${encodeURI(search)}?_q${search.replaceAll(' ', '+')}&map=ft`, { waitUntil: 'load' });
    }

    private async extractProducts(page: Page): Promise<ProductInfo[]> {
        await page.waitForSelector('.vtex-product-summary-2-x-container:not(.vtex-product-summary-2-x-container--shelf_2_carrucel)');
        //autoScroll(page);
        return await page.evaluate(() => {
            return Array.from(document.querySelectorAll('.vtex-product-summary-2-x-container')).map((product) => ({
                supermarket: 'Dia',
                search: globalThis.location.href,
                title: product.querySelector(".t-body")?.textContent || "No encontrado",
                unit: [product.querySelector('[data-specification-name="UnidaddeMedida"]')?.textContent, +(product.querySelector('[data-specification-name="PrecioPorUnd"]')?.textContent || 0)] as [string, number],
                price: +(Array.from(product.querySelectorAll('.vtex-product-price-1-x-sellingPriceValue .vtex-product-price-1-x-currencyContainer span')).map(span => span.textContent?.trim()).join('')).replace('$', '').replace('.', '').replace(',', '.'),
                image: product.querySelector("img")?.getAttribute('src') || "Imagen no encontrada",
                link: "https://diaonline.supermercadosdia.com.ar" + product.querySelector("a")?.getAttribute('href') || "Link no encontrado"
            }));
        });
    }
}