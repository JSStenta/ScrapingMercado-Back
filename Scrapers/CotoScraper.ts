import puppeteer, { Page } from "https://deno.land/x/puppeteer@16.2.0/mod.ts";
import { ProductInfo, SupermarketScraper } from "./SupermarketScraperInterface.ts";
import { delay } from "./Utils.ts";
//import { delay } from "./Utils.ts";

export class CotoScraper implements SupermarketScraper {
    async scrapeProduct(search: string): Promise<ProductInfo[]> {
        const browser = await puppeteer.launch({
            executablePath: 'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe',
            headless: false
        });
        const page = await browser.newPage();
        const results: ProductInfo[] = [];

        try {
            await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");
            
            /*
            await page.goto("https://api.cotodigital.com.ar/sitios/cdigi/nuevositio", { waitUntil: 'domcontentloaded', });
            await page.addStyleTag({ content: '.carousel-inner { display: none !important; }' }); // No carga el publicidad
            await this.performSearch(page, search); // Realiza la busqueda
            await delay(3000);
*/
            await this.performSearchURL(page, search);
            await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
            if (await page.$('.productos .card-container')) {
                //await this.sortProducts(page); // Ordena los productos
                results.push(...await this.extractProducts(page)); // Extrae los datos de productos
            } else {
                throw Error;
            }
        } catch (error) {
            console.error("Error scraping Coto:", error);
            return [];
        } finally {
            await page.close();
            await browser.close();
        }
        return results;
    }

    private async performSearch(page: Page, search: string) {
        await page.waitForSelector('.buscador input');
        await page.type('.buscador input', search, { delay: 200 });
        await delay(1000);
        await page.keyboard.press('Enter');
    }

    private async performSearchURL(page: Page, search: string) {
        await page.goto(`https://api.cotodigital.com.ar/sitios/cdigi/categoria?_dyncharset=utf-8&Dy=1&Ntt=${search}`, { waitUntil: 'domcontentloaded', });
    }

    private async extractProducts(page: Page): Promise<ProductInfo[]> {
        await page.waitForSelector('.productos .card-container');

        const products = await page.$$(".productos .card-container"); // Selecciona todos los productos
        const results: ProductInfo[] = [];

        for (let i = 0; i < products.length; i++) {
            // Selecciona de nuevo el producto después de cada navegación
            const product = (await page.$$('.productos .card-container'))[i];

            // Verifica que el producto exista en el DOM
            if (!product) {
                console.log(`Producto en índice ${i} no encontrado. Continuando con el siguiente.`);
                continue;
            }

            // Carga los datos de cada producto
            const item: ProductInfo = await page.evaluate((product) => {
                return {
                    supermarket: 'Coto',
                    search: globalThis.location.href,
                    title: product.querySelector(".nombre-producto")?.textContent || "No encontrado",
                    price: +(product.querySelector("h4")?.textContent ?? product.querySelector("h3")?.textContent).replace('$', '').replace('.', '').replace(',', '.'),
                    unit: [
                        product.querySelector(".text-center .card-text")?.textContent?.split(':')[0] || "No encontrado",
                        +((product.querySelector(".text-center .card-text")?.textContent?.split(':')[1]).replace('$', '').replace('.', '').replace(',', '.'))
                    ] as [string, number],
                    image: product.querySelector(".product-image")?.getAttribute("src") || "No disponible",
                    link: product.querySelector("a")?.href || "No disponible",
                };
            }, product);

            // Encuentra y hace click en la imagen del producto
            await page.evaluate((product) => {
                // Encuentra la imagen dentro de cada contenedor
                product.scrollIntoView({ behavior: "instant", block: "center" })
                const imageElement = product.querySelector(".product-image");

                // Simula el clic en la imagen si existe
                if (imageElement) {
                    imageElement.click();
                }
            }, product);

            await page.waitForNavigation({ waitUntil: 'domcontentloaded' });

            // Extrae la URL de la página redirigida
            item.link = page.url();

            // Vuelve a la página de productos
            await page.goBack({ waitUntil: 'domcontentloaded' });
            await delay(2000);
            await page.waitForSelector('.productos .card-container'); // Espera a que vuelva a aparecer un selector para asegurar carga

            // Añade el item al array de resultados
            results.push(item);
        }

        return results;
    }

    private async sortProducts(page: Page) {
        await page.waitForSelector('.form-select');
        await page.evaluate(() => {
            /*if (Array.from(document.querySelectorAll('.select')).find(encuentrant => encuentrant.textContent?.trim() === 'No se han encontrado artículos coincidentes') !== undefined) { throw new Error("No se han encontrado artículos coincidentes"); }
            else {
            }*/
            const menor = Array.from(document.querySelectorAll('option')).find(option => option.value == 'sort.priceLH');
            if (menor) {
                menor.selected = true; // Selecciona la opción en el DOM
                menor.parentElement?.dispatchEvent(new Event('change')); // Dispara el evento "change"
            }
        });
        await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
    }

}
